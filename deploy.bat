@echo off
echo Starting Python HTTP Server...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo Starting server...
python -m http.server 8000
pause 