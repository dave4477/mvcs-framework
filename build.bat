@ECHO OFF
ECHO.
ECHO. Building framework classes into a release file.
ECHO.

rollup src/core/fw.js --file release/fw.module.js --format iife --name "fw"
