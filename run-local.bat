@echo off
setlocal enabledelayedexpansion

echo ========================================================================
echo  ChangeRipple — Full-Stack Software Change Impact Intelligence Platform
echo ========================================================================
echo.

:: Detect Java 21
if defined JAVA_HOME (
    set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
) else if exist "C:\Program Files\JetBrains\CLion 2025.2\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\JetBrains\CLion 2025.2\jbr"
    set "JAVA_CMD=C:\Program Files\JetBrains\CLion 2025.2\jbr\bin\java.exe"
) else (
    set "JAVA_CMD=java"
)

:: Detect Maven
if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
    set "MVN_CMD=C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
) else (
    set "MVN_CMD=mvn"
)

echo [INFO] Using Java Home: %JAVA_HOME%
echo [INFO] Using Maven: %MVN_CMD%
echo.

echo Choose startup mode:
echo [1] Start Backend Only (Spring Boot on port 8080)
echo [2] Start Frontend Only (Vite on port 5173)
echo [3] Run Backend Test Suite (JUnit 5 + MockMvc)
echo [4] Run Frontend Test Suite (Vitest)
echo [5] Start Both Backend and Frontend in separate windows
echo.
set /p choice="Enter option (1-5): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto test_backend
if "%choice%"=="4" goto test_frontend
if "%choice%"=="5" goto start_both
goto invalid_choice

:start_backend
echo [INFO] Starting Spring Boot Backend on http://localhost:8080 ...
cd /d "%~dp0backend"
call "%MVN_CMD%" spring-boot:run
goto end

:start_frontend
echo [INFO] Starting Vite Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
call npm run dev
goto end

:test_backend
echo [INFO] Executing Backend JUnit 5 Test Suite ...
cd /d "%~dp0backend"
call "%MVN_CMD%" test
goto end

:test_frontend
echo [INFO] Executing Frontend Vitest Test Suite ...
cd /d "%~dp0frontend"
call npm test
goto end

:start_both
echo [INFO] Launching Backend and Frontend in separate windows...
start "ChangeRipple Backend (Port 8080)" cmd /k "cd /d %~dp0backend && set JAVA_HOME=%JAVA_HOME% && \"%MVN_CMD%\" spring-boot:run"
timeout /t 5 /nobreak >nul
start "ChangeRipple Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo [INFO] Services launched!
echo - Backend:  http://localhost:8080/swagger-ui.html
echo - Frontend: http://localhost:5173
goto end

:invalid_choice
echo [ERROR] Invalid selection.
goto end

:end
endlocal
