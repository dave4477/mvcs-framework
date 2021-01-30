@ECHO OFF
ECHO. 
ECHO. Creating ecma-script 2015 compatible
ECHO.

npx babel release\fw.module.js --out-file release\fw.script.js --presets babel-preset-es2015