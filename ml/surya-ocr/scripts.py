import os
import uvicorn

port = int(os.getenv("PORT", 3000))

def dev():
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)


def serve():
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
