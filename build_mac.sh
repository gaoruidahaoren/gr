#!/bin/bash

echo "开始打包应用..."

# 检查并创建虚拟环境
if [ ! -d ".venv312" ]; then
    echo "创建虚拟环境..."
    python3.12 -m venv .venv312
fi

# 激活虚拟环境
source .venv312/bin/activate

# 升级 pip 并安装依赖
echo "安装依赖..."
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller==6.11.1

# 使用 PyInstaller 打包
echo "开始打包..."
pyinstaller --noconfirm --clean --onefile --name MeterExcelApp \
    --paths . \
    --hidden-import uvicorn.logging \
    --hidden-import uvicorn.loops.auto \
    --hidden-import uvicorn.protocols.http.auto \
    --hidden-import uvicorn.protocols.websockets.auto \
    --collect-all openpyxl \
    --collect-all openai \
    --collect-all pydantic \
    --add-data "web:web" \
    run_local.py

echo ""
echo "打包完成! 可执行文件位置: dist/MeterExcelApp"
echo ""
