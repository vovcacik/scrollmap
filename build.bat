@echo off
setlocal

for /F "usebackq tokens=3 delims=<>" %%v in (`type install.rdf ^| findstr /irc:"em:version"`) do (
    set version=%%v
)

7za a -tzip scrollmap-%version%-fx.xpi -i@build.include -x@build.exclude
exit /B 0
