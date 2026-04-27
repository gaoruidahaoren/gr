# 电表识别与Excel计算服务（本地可执行版）

## 功能
- 本地网页上传多张电表图片。
- 可选上传昨天生成的Excel，自动合并今天读数。
- 调用阿里多模态模型（DashScope 兼容接口）识别电表读数与层级。
- 自动计算每个电表当日用电量：`当日电表读数 * 倍率`。
- 自动校核父子表：`差值 = 父表当日用电量 - 子表当日用电量合计`。
- 返回包含3个sheet的Excel文件。

## 本地开发运行
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export DASHSCOPE_API_KEY="你的key"
# 可选：export DASHSCOPE_MODEL="qwen-vl-max-latest"

uvicorn src.app:app --host 0.0.0.0 --port 8000
```

访问：`http://127.0.0.1:8000/`

## Windows 直接运行（不打包）
在 Windows 上双击：`run_windows.bat`

## Windows 打包成 EXE（推荐分发）

### 1) 在 Windows 构建
> 建议在目标 Windows 环境构建，避免跨平台打包问题。

双击执行：`build_windows.bat`

生成文件：`dist\MeterExcelApp.exe`

### 2) 分发给别人
你可以把以下文件打包发给别人：
- `dist\MeterExcelApp.exe`

对方双击 `MeterExcelApp.exe` 后会自动打开浏览器页面，上传电表图片并下载 Excel。

## API调用示例
```bash
curl -X POST "http://127.0.0.1:8000/process" \
  -F "model=qwen-vl-max-latest" \
  -F "files=@/path/to/电表图1.jpg" \
  -F "files=@/path/to/电表图2.jpg" \
  --output meter_result.xlsx
```

## 是否需要 Nginx
你当前这个“本地程序包分发”方案不需要 Nginx。
Nginx 仅在你部署到公网服务器时才建议使用。

## 注意
- 识别准确率取决于图片清晰度与字段可见性。
- 若仅识别到1个日期，也会按该日期进行总分校核，不再计算两天差值。
- 上传昨天Excel + 今天图片时，会自动追加今天读数并按“今天-昨天”输出差值。
