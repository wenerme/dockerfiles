import signal
import sys
import threading
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
import os
import shutil
import logging
from dotenv import load_dotenv
from PIL import Image
from surya.settings import settings
import surya
import surya.model.detection.model
import surya.model.recognition.model
import surya.model.ordering.model
import surya.model.table_rec.model
import surya.model.table_rec.processor
import surya.model.ordering.processor
import surya.model.recognition.processor

load_dotenv()
load_dotenv(".env.local", override=True)

# 设置日志记录
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 定义全局上传目录
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def signal_handler(signal, frame):
    print("SIGINT received, shutting down gracefully...")
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)


# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time

    start_time = time.time()
    logger.info(f"> {request.method} {request.url}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"< {response.status_code} (Time taken: {process_time:.2f}s)")
    return response


# 定义 Ping API
@app.get("/ping")
async def ping():
    return {"message": "pong"}


_cache = {}
_cache_lock = threading.Lock()


@app.post("/reset")
async def reset_cache():
    global _cache
    with _cache_lock:
        _cache = {}
    return {"status": "success"}


def load_cache(*keys: str) -> list:
    results = []

    with _cache_lock:
        for key in keys:
            if key in _cache:
                results.append(_cache[key])
            else:
                if key == "detection.model":
                    _cache[key] = surya.model.detection.model.load_model()
                elif key == "detection.processor":
                    _cache[key] = surya.model.detection.model.load_processor()
                elif key == "recognition.model":
                    _cache[key] = surya.model.recognition.model.load_model()
                elif key == "recognition.processor":
                    _cache[key] = surya.model.recognition.processor.load_processor()
                elif key == "ordering.model":
                    _cache[key] = surya.model.ordering.model.load_model()
                elif key == "ordering.processor":
                    _cache[key] = surya.model.ordering.processor.load_processor()
                elif key == "layout.model":
                    _cache[key] = surya.model.detection.model.load_model(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
                elif key == "layout.processor":
                    _cache[key] = surya.model.detection.model.load_processor(
                        checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
                elif key == "table_rec.model":
                    _cache[key] = surya.model.table_rec.model.load_model()
                elif key == "table_rec.processor":
                    _cache[key] = surya.model.table_rec.processor.load_processor()
                else:
                    raise ValueError(f"Unknown key: {key}")

                results.append(_cache[key])
    return results


# 定义 OCR 处理的 API 路由
@app.post("/ocr")
async def ocr(images: list[UploadFile] = File(...), langs: str = None):
    from surya.input.langs import replace_lang_with_code
    from surya.ocr import run_ocr

    det_model, det_processor, rec_model, rec_processor = load_cache(
        "detection.model",
        "detection.processor",
        "recognition.model",
        "recognition.processor"
    )

    # 保存文件到服务器临时目录
    images_paths = []
    for image in images:
        temp_path = os.path.join(UPLOAD_DIR, image.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        images_paths.append(temp_path)

    # 处理语言参数
    if langs:
        langs = langs.split(",")
        replace_lang_with_code(langs)
        image_langs = [langs] * len(images_paths)
    else:
        image_langs = [None] * len(images_paths)

    # 使用 Surya OCR 处理图片
    try:
        loaded_images = [Image.open(path) for path in images_paths]
        result = run_ocr(
            loaded_images,
            image_langs,
            det_model,
            det_processor,
            rec_model,
            rec_processor,
        )

        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 删除临时文件
        for path in images_paths:
            if os.path.exists(path):
                os.remove(path)


def load_images(images: list[UploadFile] = File(...)):
    return [Image.open(image.file) for image in images]


# 定义检测 API
@app.post("/detect")
async def detect(images: list[UploadFile] = File(...)):
    from surya.detection import batch_text_detection
    model, processor = load_cache("detection.model", "detection.processor")

    try:
        results = batch_text_detection(
            [Image.open(image.file) for image in images], model, processor
        )
        data = [
            {
                "page": idx,
                "bboxes": res.bboxes,
                "vertical_lines": res.vertical_lines,
                "image_bbox": res.image_bbox,
            }
            for idx, res in enumerate(results)
        ]
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 定义布局分析 API
@app.post("/layout")
async def detect(images: list[UploadFile] = File(...)):
    from surya.detection import batch_text_detection
    from surya.layout import batch_layout_detection

    model, processor, det_model, det_processor = load_cache("layout.model", "layout.processor", "detection.model",
                                                            "detection.processor")

    try:
        _images = [Image.open(image.file) for image in images]
        line_predictions = batch_text_detection(_images, det_model, det_processor)
        layout_predictions = batch_layout_detection(
            _images, model, processor, line_predictions
        )
        return {
            "data": [
                {
                    "page": idx,
                    "bboxes": res.bboxes,
                    "image_bbox": res.image_bbox,
                }
                for idx, res in enumerate(layout_predictions)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 定义表格识别 API（默认使用 Surya）
@app.post("/table")
async def table(images: list[UploadFile] = File(...)):
    from surya.tables import batch_table_recognition
    from surya.detection import batch_text_detection
    from surya.layout import batch_layout_detection
    from surya.input.load import load_from_folder, load_from_file
    from surya.postprocessing.util import rescale_bboxes, rescale_bbox
    from surya.input.pdflines import get_table_blocks

    model, processor, layout_model, layout_processor, det_model, det_processor = load_cache("table_rec.model",
                                                                                            "table_rec.processor",
                                                                                            "layout.model",
                                                                                            "layout.processor",
                                                                                            "detection.model",
                                                                                            "detection.processor")

    tmpdir = load_images_dir(images)
    try:
        images, _, _ = load_from_folder(tmpdir, None)
        highres_images, names, text_lines = load_from_folder(tmpdir, None, dpi=settings.IMAGE_DPI_HIGHRES,
                                                             load_text_lines=True)
        pnums = []
        prev_name = None
        for i, name in enumerate(names):
            if prev_name is None or prev_name != name:
                pnums.append(0)
            else:
                pnums.append(pnums[-1] + 1)

            prev_name = name

        line_predictions = batch_text_detection(images, det_model, det_processor)
        layout_predictions = batch_layout_detection(images, layout_model, layout_processor, line_predictions)

        table_cells = []
        table_imgs = []
        table_counts = []
        skip_table_detection = False
        detect_boxes = True

        for layout_pred, text_line, img, highres_img in zip(layout_predictions, text_lines, images, highres_images):
            # The table may already be cropped
            if skip_table_detection:
                table_imgs.append(highres_img)
                table_counts.append(1)
                page_table_imgs = [highres_img]
                highres_bbox = [[0, 0, highres_img.size[0], highres_img.size[1]]]
            else:
                # The bbox for the entire table
                bbox = [l.bbox for l in layout_pred.bboxes if l.label == "Table"]
                # Number of tables per page
                table_counts.append(len(bbox))

                if len(bbox) == 0:
                    continue

                page_table_imgs = []
                highres_bbox = []
                for bb in bbox:
                    highres_bb = rescale_bbox(bb, img.size, highres_img.size)
                    page_table_imgs.append(highres_img.crop(highres_bb))
                    highres_bbox.append(highres_bb)

                table_imgs.extend(page_table_imgs)

            # The text cells inside each table
            table_blocks = get_table_blocks(highres_bbox, text_line,
                                            highres_img.size) if text_line is not None else None
            if text_line is None or detect_boxes or any(len(tb) == 0 for tb in table_blocks):
                det_results = batch_text_detection(page_table_imgs, det_model, det_processor, )
                cell_bboxes = [[{"bbox": tb.bbox, "text": None} for tb in det_result.bboxes] for det_result in
                               det_results]
                table_cells.extend(cell_bboxes)
            else:
                table_cells.extend(table_blocks)

        table_preds = batch_table_recognition(table_imgs, table_cells, model, processor)

        return {
            "data": [
                {
                    "cells": [cell.model_dump() for cell in res.cells],
                    "rows": [row.model_dump() for row in res.rows],
                    "cols": [col.model_dump() for col in res.cols],
                } for idx, res in enumerate(table_preds)
            ]
        }
    except Exception as e:
        logger.error(f"Error processing table: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def load_images_dir(images: list[UploadFile]):
    import uuid
    tmpdir = os.path.join(UPLOAD_DIR, f"images-{uuid.uuid4()}")
    os.makedirs(tmpdir, exist_ok=True)
    for idx, image in enumerate(images):
        temp_path = os.path.join(tmpdir, image.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    return tmpdir


# 定义使用 tabled 进行表格识别的 API
@app.post("/tabled")
async def tabled(images: list[UploadFile] = File(...)):
    from tabled.extract import extract_tables
    from tabled.fileinput import load_pdfs_images
    from tabled.formats import csv_format, html_format

    det_models, rec_models = load_cache("detection.model", "recognition.model")

    tmpdir = load_images_dir(images)

    try:
        images, highres_images, names, text_lines = load_pdfs_images(tmpdir)
        result = extract_tables(
            images,
            highres_images,
            text_lines,
            det_models,
            rec_models,
            detect_boxes=True,
        )

        return {
            "data": [
                {
                    "page": idx,
                    "filename": names[idx],
                    "cells": res.cells,
                    "rows_cols": res.rows_cols,
                    "tables": [
                        {
                            "csv": csv_format(cell),
                            "html": html_format(cell),
                            "json": {
                                "cells": [c.model_dump() for c in cell],
                                "rows": [
                                    r.model_dump() for r in res.rows_cols[ci].rows
                                ],
                                "cols": [
                                    c.model_dump() for c in res.rows_cols[ci].cols
                                ],
                            },
                        }
                        for ci, cell in enumerate(res.cells)
                    ],
                }
                for idx, res in enumerate(result)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# 定义阅读顺序 API
@app.post("/reading-order")
async def reading_order(images: list[UploadFile] = File(...)):
    from surya.ordering import batch_ordering

    model, processor = load_cache("ordering.model", "ordering.processor")

    _images = [Image.open(image.file) for image in images]

    try:
        result = batch_ordering(_images, [bboxes], model, processor)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 运行 FastAPI 服务器需要使用 Uvicorn
# 使用以下命令运行： uvicorn filename:app --reload --host 0.0.0.0 --port 3050
