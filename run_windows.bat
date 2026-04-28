@echo off
chcp 65001 >nul
setlocal EnableExtensions

where py >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未找到 Python Launcher (py)。请先安装 Python 3.12+，并勾选 "Add Python to PATH"。
  pause
  exit /b 1
)

if not exist .venv (
  py -3.12 -m venv .venv 2>nul
  if errorlevel 1 (
    py -3 -m venv .venv
  )
  if errorlevel 1 (
    echo [ERROR] 创建虚拟环境失败，请确认已安装可用的 Python 3。
    pause
    exit /b 1
  )
)

call .venv\Scripts\activate.bat
if errorlevel 1 (
  echo [ERROR] 激活虚拟环境失败：.venv\Scripts\activate.bat
  pause
  exit /b 1
)

python -m pip install --upgrade pip
if errorlevel 1 (
  echo [ERROR] 升级 pip 失败。
  pause
  exit /b 1
)

pip install -r requirements.txt
if errorlevel 1 (
  echo [ERROR] 安装依赖失败，请检查网络连接或 Python 版本是否兼容。
  pause
  exit /b 1
)

echo 服务启动中，请稍候...
python run_local.py
if errorlevel 1 (
  echo.
  echo [ERROR] 程序启动失败，请根据上面的日志排查问题。
  pause
  exit /b 1
)

endlocal
