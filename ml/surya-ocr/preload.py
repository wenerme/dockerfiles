import logging
import tabled.inference.models
import surya.model.detection.model
import surya.model.recognition.model
import surya.model.ordering.model
import surya.model.ordering.processor
import surya.model.table_rec.model
import surya.model.table_rec.processor
from surya.settings import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Preload models
logger.info("Preloading models...")

# Surya models
surya.model.detection.model.load_model()
surya.model.detection.model.load_processor()
surya.model.recognition.model.load_model()
surya.model.recognition.processor.load_processor()
surya.model.ordering.model.load_model()
surya.model.ordering.processor.load_processor()
surya.model.table_rec.model.load_model()
surya.model.table_rec.processor.load_processor()
# layout
surya.model.detection.model.load_model(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)
surya.model.detection.model.load_processor(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)

# Tabled models
tabled.inference.models.load_detection_models()
tabled.inference.models.load_recognition_models()

logger.info("Models preloaded successfully.")
