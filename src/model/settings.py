from typing import Any

APP_BUILD = "2026-04-25-fixed-topology-v8"
DEFAULT_DASHSCOPE_API_KEY = "sk-c3e1a07397a1481aa42cbb560d01cbf7"

FIXED_TOPOLOGY: dict[str, dict[str, Any]] = {
    "L1": {"name": "绿化公司总表", "aliases": ("绿化公司总表", "绿化公司"), "parent": None, "level": 1, "multiplier": 800},
    "L2-1": {"name": "一部办公区", "aliases": ("一部办公区",), "parent": "L1", "level": 2, "multiplier": 80},
    "L2-2": {"name": "充电桩板房", "aliases": ("充电桩板房",), "parent": "L1", "level": 2, "multiplier": 1},
    "L2-3": {"name": "小粉碎机", "aliases": ("小粉碎机",), "parent": "L1", "level": 2, "multiplier": 1},
    "L2-4": {"name": "大粉碎机", "aliases": ("大粉碎机",), "parent": "L1", "level": 2, "multiplier": 1},
    "L2-5": {"name": "六部电表", "aliases": ("六部电表",), "parent": "L1", "level": 2, "multiplier": 1},
    "L2-6": {"name": "机关办公楼", "aliases": ("机关办公楼", "办公楼"), "parent": "L1", "level": 2, "multiplier": 50},
    "L3-1-1": {"name": "民工区", "aliases": ("民工区",), "parent": "L2-1", "level": 3, "multiplier": 1},
    "L3-1-2": {"name": "六部新电表", "aliases": ("六部新电表",), "parent": "L2-1", "level": 3, "multiplier": 1},
    "L3-6-1": {"name": "安保处", "aliases": ("安保处",), "parent": "L2-6", "level": 3, "multiplier": 1},
    "L3-6-2": {"name": "铁塔一层", "aliases": ("铁塔一层", "铁塔一层基站"), "parent": "L2-6", "level": 3, "multiplier": 1},
    "L3-6-3": {"name": "铁塔四层", "aliases": ("铁塔四层", "铁塔四层基站"), "parent": "L2-6", "level": 3, "multiplier": 1},
}

PROMPT = """
你是电表识别与数据结构化助手。请从用户上传的图片中提取三层树状电表结构与读数。
必须只返回 JSON，不要输出任何解释。
JSON 格式必须为：
{
  "time_range": "可选",
  "company": "可选",
  "nodes": [
    {
      "id": "L1|L2-1|L3-1-1 等唯一编码，没有就自行生成",
      "name": "电表名称",
      "meter_type": "total 或 sub，不确定可省略",
      "parent_id": null 或 "父节点id",
      "level": 1|2|3,
      "multiplier": 1.0,
      "readings": [
        {"date": "YYYY-MM-DD", "value": 123.45},
        {"date": "YYYY-MM-DD", "value": 124.45}
      ]
    }
  ]
}
规则：
1) 仅提取能明确识别的数据，不能瞎编；不确定就略过该字段或该节点。
2) readings 必须按日期升序。
3) multiplier 默认 1。
4) 如果没有结构图，也要尽量根据电表编号/名称推断 parent_id、level（例如 L3-6-1 的父级通常是 L2-6；名称包含“总表”通常是父表）。
5) 重点识别 12 个固定电表：L1, L2-1~L2-6, L3-1-1, L3-1-2, L3-6-1, L3-6-2, L3-6-3。
6) 至少返回 1 个节点，否则返回 {"nodes": []}。
""".strip()
