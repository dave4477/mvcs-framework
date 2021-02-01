@ECHO OFF
ECHO. 
ECHO. Creating ecma-script 2015 compatible
ECHO.

REM npx babel release\fw.module.js --out-file release\fw.script.js --presets babel-preset-es2015 --plugins @babel/plugin-syntax-dynamic-import
npx babel release\fw.module.js --out-file release\fw.script.js --plugins @babel/plugin-syntax-dynamic-import