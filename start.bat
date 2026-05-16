@echo off
chcp 65001 >nul
title GAP 规划助手 - 本地服务器

echo.
echo   ╔════════════════════════════════╗
echo   ║   🏖️  GAP 生活规划助手       ║
echo   ║                              ║
echo   ║   启动本地服务器...          ║
echo   ╚════════════════════════════════╝
echo.

:: 获取本机 IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo   📱 手机端访问地址：
echo.
echo      http://%LOCAL_IP%:8080
echo.
echo   💻 电脑端访问地址：
echo.
echo      http://localhost:8080
echo.
echo   ⚠️  确保手机和电脑在同一 WiFi 下
echo   ⚠️  按 Ctrl+C 停止服务器
echo.

:: 尝试 Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ 使用 Python 启动...
    echo.
    python -m http.server 8080 --bind 0.0.0.0
    goto :end
)

:: 尝试 npx
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ 使用 npx http-server 启动...
    echo.
    npx http-server -p 8080 -a 0.0.0.0 -c-1
    goto :end
)

echo   ❌ 未找到 Python 或 Node.js，请安装其中之一后重试。
pause
:end
