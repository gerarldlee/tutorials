@echo off
REM Starting vault
cd vault
start start_server.bat
cd ..

REM Starting site
start node site.js 

REM Starting redbird proxy
start node redbird.js