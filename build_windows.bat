@echo off
chcp 65001 >nul
setlocal EnableExtensions

where py >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未找到 Python Launcher (py). 请先安装 Python 3.12+ 并勾选 "Add Python to PATH".
  exit /b 1
)

if not exist .venv (
  py -3.12 -m venv .venv 2>nul
  if errorlevel 1 (
    py -3 -m venv .venv
  )
)

call .venv\Scripts\activate.bat
if errorlevel 1 (
  echo [ERROR] 激活虚拟环境失败: .venv\Scripts\activate.bat
  exit /b 1
)

python -m pip install --upgrade pip
if errorlevel 1 exit /b 1
pip install -r requirements.txt
if errorlevel 1 exit /b 1
pip install pyinstaller==6.11.1
if errorlevel 1 exit /b 1

pyinstaller --noconfirm --clean --onefile --name MeterExcelApp ^
  --paths . ^
  --hidden-import uvicorn.logging ^
  --hidden-import uvicorn.loops.auto ^
  --hidden-import uvicorn.protocols.http.auto ^
  --hidden-import uvicorn.protocols.websockets.auto ^
  --collect-all openpyxl ^
  --collect-all openai ^
  --collect-all pydantic ^
  --add-data "web;web" ^
  run_local.py
if errorlevel 1 exit /b 1

echo.
echo Build complete. EXE path: dist\MeterExcelApp.exe
endlocal
