import sys
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse

from src.model.settings import APP_BUILD
from src.tool.excel_tool import build_excel, compute_usage
from src.tool.topology_tool import load_previous_excel, merge_previous_and_today, normalize_payload
from src.tool.vision_tool import call_vision_llm
from src.utli.common import resolve_base_dir

app = FastAPI(title="Meter OCR & Excel Calculator", version="1.0.0")
BASE_DIR = resolve_base_dir(__file__, getattr(sys, "frozen", False), getattr(sys, "_MEIPASS", None))


@app.post("/process")
async def process_meter_images(
    files: list[UploadFile] = File(..., description="上传电表图片，支持多张"),
    model: str = Form(default="qwen-vl-max-latest"),
    previous_excel: UploadFile | None = File(default=None, description="可选：上传昨天生成的Excel"),
    meter_date: str | None = Form(default=None, description="可选：本次电表所属日期，格式 YYYY-MM-DD"),
):
    raw = call_vision_llm(files, model=model)
    normalized = normalize_payload(raw, meter_date=meter_date)

    if previous_excel is not None and previous_excel.filename:
        previous = load_previous_excel(previous_excel)
        normalized = merge_previous_and_today(previous, normalized)

    dates, usage_rows, balance_rows = compute_usage(normalized)
    result_path = build_excel(normalized, dates, usage_rows, balance_rows)

    return FileResponse(
        path=result_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="meter_result.xlsx",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/version")
def version() -> dict[str, str]:
    return {"build": APP_BUILD, "mode": "fixed-topology-daily-check"}


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    index_file = BASE_DIR / "web" / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="前端页面不存在: web/index.html")
    return index_file.read_text(encoding="utf-8")
