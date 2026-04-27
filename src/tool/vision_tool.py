import base64
import json
import os
from typing import Any

from fastapi import HTTPException, UploadFile
from openai import OpenAI

from src.model.settings import DEFAULT_DASHSCOPE_API_KEY, PROMPT


def _to_data_url(content: bytes, content_type: str) -> str:
    b64 = base64.b64encode(content).decode("utf-8")
    return f"data:{content_type};base64,{b64}"


def _llm_extract_single_image(client: OpenAI, model: str, content: bytes, content_type: str) -> dict[str, Any]:
    content_items: list[dict[str, Any]] = [
        {"type": "text", "text": PROMPT},
        {"type": "image_url", "image_url": {"url": _to_data_url(content, content_type)}},
    ]
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": content_items}],
        response_format={"type": "json_object"},
        temperature=0,
    )
    raw = resp.choices[0].message.content or "{}"
    return json.loads(raw)


def call_vision_llm(files: list[UploadFile], model: str) -> dict[str, Any]:
    api_key = os.getenv("DASHSCOPE_API_KEY") or os.getenv("OPENAI_API_KEY") or DEFAULT_DASHSCOPE_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="DASHSCOPE_API_KEY 未配置")

    base_url = os.getenv("DASHSCOPE_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    client = OpenAI(api_key=api_key, base_url=base_url)

    valid_images: list[tuple[bytes, str]] = []
    for f in files:
        content = f.file.read()
        if content:
            valid_images.append((content, f.content_type or "image/png"))

    if not valid_images:
        raise HTTPException(status_code=400, detail="未收到有效图片")

    merged_nodes: list[dict[str, Any]] = []
    company = ""
    time_range = ""
    errors: list[str] = []

    for idx, (content, content_type) in enumerate(valid_images, start=1):
        try:
            one = _llm_extract_single_image(client, model, content, content_type)
            if not company and one.get("company"):
                company = str(one.get("company"))
            if not time_range and one.get("time_range"):
                time_range = str(one.get("time_range"))
            nodes = one.get("nodes", [])
            if isinstance(nodes, list):
                for n in nodes:
                    if isinstance(n, dict):
                        n["_src_image_index"] = idx
                        merged_nodes.append(n)
        except Exception as exc:
            errors.append(f"image#{idx}: {exc}")

    if not merged_nodes:
        err_text = "；".join(errors[:3]) if errors else "模型未返回节点"
        raise HTTPException(status_code=500, detail=f"图片识别失败: {err_text}")

    return {"company": company, "time_range": time_range, "nodes": merged_nodes}
