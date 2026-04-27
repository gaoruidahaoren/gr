# 项目打包说明

## macOS/Linux 打包

1. 打开终端,进入项目目录:
   ```bash
   cd /Users/gaorui/PycharmProjects/PythonProject3
   ```

2. 运行打包脚本:
   ```bash
   chmod +x build_mac.sh
   ./build_mac.sh
   ```

3. 打包完成后,可执行文件位于: `dist/MeterExcelApp`

4. 运行应用:
   ```bash
   ./dist/MeterExcelApp
   ```

## Windows 打包

如果您需要在 Windows 上生成 .exe 文件,有两种方式:

### 方式一:在 Windows 系统上打包
1. 将项目复制到 Windows 电脑
2. 运行 `build_windows.bat` 脚本
3. 生成的 exe 文件位于: `dist\MeterExcelApp.exe`

### 方式二:使用 Docker 交叉编译(高级)
需要配置 Wine 或 MinGW 等交叉编译环境,较为复杂,不推荐。

## 注意事项

- macOS 上生成的可执行文件只能在 macOS 上运行
- Windows 的 .exe 文件只能在 Windows 上运行
- 如需跨平台分发,需要在对应平台上分别打包
- 确保已安装 Python 3.12
