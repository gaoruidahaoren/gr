import re
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import HTTPException


def safe_float(v: Any, default: float = 0.0) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def parse_date(d: str) -> datetime:
    return datetime.strptime(d, "%Y-%m-%d")


def today_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def normalize_meter_date(meter_date: str | None) -> str:
    if not meter_date:
        return today_str()
    try:
        return datetime.strptime(meter_date, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="meter_date 格式必须为 YYYY-MM-DD") from exc


def normalize_name(text: str) -> str:
    return re.sub(r"[\\s（）()【】\\-—_]", "", text or "").lower()


def name_hit(name: str, aliases: tuple[str, ...]) -> bool:
    norm = normalize_name(name)
    return any(normalize_name(alias) in norm for alias in aliases)


def resolve_base_dir(app_file: str, frozen: bool, meipass: str | None) -> Path:
    if frozen and meipass:
        return Path(meipass)
    return Path(app_file).resolve().parent.parent
