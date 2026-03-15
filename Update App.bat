@echo off
echo Updating Unique Pack Application...
echo Please wait, this may take a minute.
echo.

:: Run the build command
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Update Successful!
    echo You can now use "Start App.vbs" to run the latest version.
    pause
) else (
    echo.
    echo Update Failed! Please check for errors in the terminal above.
    pause
)
