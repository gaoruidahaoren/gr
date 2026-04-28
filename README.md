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

## Windows 用户使用方式（推荐）

Windows 普通用户不要运行 `run_windows.bat`，因为它需要本机先安装 Python。

建议直接下载发布好的 exe：

1. 打开 GitHub 项目的 `Releases`
2. 下载 `MeterExcelApp-Windows.zip` 或 `MeterExcelApp.exe`
3. 解压后双击 `MeterExcelApp.exe`

这样对方电脑不需要安装 Python，只需要能正常联网即可。

## Windows 源码运行（开发者用）
如果你是开发者，且本机已经安装 Python 3.12+，可以在 Windows 上双击：`run_windows.bat`

## Windows 打包成 EXE

### 1) 在 Windows 构建
> 建议在目标 Windows 环境构建，避免跨平台打包问题。

双击执行：`build_windows.bat`

生成文件：`dist\MeterExcelApp.exe`

### 2) 发布给别人
建议不要直接让别人下载源码后运行 `run_windows.bat`，而是发布以下文件：
- `dist\MeterExcelApp.exe`
- `dist\MeterExcelApp-Windows.zip`

对方双击 `MeterExcelApp.exe` 后会自动打开浏览器页面，上传电表图片并下载 Excel。

### 3) 使用 GitHub Actions 自动发布
本项目已配置 GitHub Actions 自动构建 Windows 版 exe：

1. 推送普通代码到 `main` 或 `master` 时，会自动构建并生成 Actions artifact
2. 推送版本 tag（例如 `v1.0.0`）时，会自动：
   - 构建 `MeterExcelApp.exe`
   - 打包 `MeterExcelApp-Windows.zip`
   - 上传到当前版本的 GitHub Release

示例命令：

```bash
git tag v1.0.0
git push origin v1.0.0
```

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
