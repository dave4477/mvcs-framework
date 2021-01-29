@ECHO OFF
ECHO. 
ECHO. Creating ecma-script 2015 compatible
ECHO.

npx babel release\fw_rolled.js --out-file release\fw_es5.js --presets babel-preset-es2015