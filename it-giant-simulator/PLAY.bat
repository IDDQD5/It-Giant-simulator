@echo off
title IT Giant Simulator - Launch
echo.
echo  ██╗████████╗     ██████╗ ██╗ █████╗ ███╗   ██╗████████╗
echo  ██║╚══██╔══╝    ██╔════╝ ██║██╔══██╗████╗  ██║╚══██╔══╝
echo  ██║   ██║       ██║  ███╗██║███████║██╔██╗ ██║   ██║
echo  ██║   ██║       ██║   ██║██║██╔══██║██║╚██╗██║   ██║
echo  ██║   ██║       ╚██████╔╝██║██║  ██║██║ ╚████║   ██║
echo  ╚═╝   ╚═╝        ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝
echo.
echo  [1] Starting game server on http://localhost:8080 ...
echo  [2] Opening browser...
echo.

start "" http://localhost:8080
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
