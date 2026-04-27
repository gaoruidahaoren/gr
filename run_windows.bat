@echo off
setlocal

if not exist .venv (
  py -3.12 -m venv .venv
)

call .venv\Scripts\activate
pip install -r requirements.txt
python run_local.py

endlocal
