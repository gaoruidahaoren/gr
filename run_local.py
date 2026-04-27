import os
import threading
import time
import webbrowser

import uvicorn
from src.app import app


def open_browser(url: str, delay: float = 1.2) -> None:
    time.sleep(delay)
    webbrowser.open(url)


if __name__ == "__main__":
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", "8000"))
    url = f"http://{host}:{port}/"

    t = threading.Thread(target=open_browser, args=(url,), daemon=True)
    t.start()

    uvicorn.run(app, host=host, port=port, log_level="info")
