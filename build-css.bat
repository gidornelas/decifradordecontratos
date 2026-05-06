@echo off
REM =====================================================
REM  CSS Consolidation — Decodificador de Contratos
REM  Combines all CSS files into a single production file
REM  Maintains correct cascade order
REM =====================================================

setlocal enabledelayedexpansion

set OUTFILE=css\bundle.css
set DATE=%date% %time:~0,8%

echo. > %OUTFILE%
echo ====================================================>> %OUTFILE%
echo  Decodificador de Contratos — Production CSS Bundle>> %OUTFILE%
echo  Generated: %DATE%>> %OUTFILE%
echo  DO NOT EDIT — regenerate with build-css.bat>> %OUTFILE%
echo ====================================================>> %OUTFILE%
echo.>> %OUTFILE%

REM Token layer — must come first
echo /* === TOKENS === */>> %OUTFILE%
type css\tokens.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === RESET === */>> %OUTFILE%
type css\reset.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === BASE === */>> %OUTFILE%
type css\base.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === LAYOUT === */>> %OUTFILE%
type css\layout.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === ANIMATIONS === */>> %OUTFILE%
type css\animations.css>> %OUTFILE%
echo.>> %OUTFILE%

REM Component layer — order matches HTML
echo /* === NAVBAR === */>> %OUTFILE%
type css\components\navbar.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === HERO === */>> %OUTFILE%
type css\components\hero.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === TRUST === */>> %OUTFILE%
type css\components\trust.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === HOW IT WORKS === */>> %OUTFILE%
type css\components\how-it-works.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === UPLOAD === */>> %OUTFILE%
type css\components\upload.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === ANALYSIS === */>> %OUTFILE%
type css\components\analysis.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === RISK VIEWING === */>> %OUTFILE%
type css\components\risk-viewing.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === GUIDED REVIEW === */>> %OUTFILE%
type css\components\guided-review.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === DASHBOARD === */>> %OUTFILE%
type css\components\dashboard.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === FEATURES === */>> %OUTFILE%
type css\components\features.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === DEMO === */>> %OUTFILE%
type css\components\demo.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === PRICING === */>> %OUTFILE%
type css\components\pricing.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === TESTIMONIALS === */>>>> %OUTFILE%
type css\components\testimonials.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === FAQ === */>> %OUTFILE%
type css\components\faq.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === CHECKLIST === */>> %OUTFILE%
type css\components\checklist.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === CTA FINAL === */>> %OUTFILE%
type css\components\cta-final.css>> %OUTFILE%
echo.>> %OUTFILE%

echo /* === FOOTER === */>> %OUTFILE%
type css\components\footer.css>> %OUTFILE%
echo.>> %OUTFILE%

REM Theme layer — must come last for dark mode overrides
echo /* === DARK MODE === */>> %OUTFILE%
type css\dark-mode.css>> %OUTFILE%
echo.>> %OUTFILE%

echo.
echo Bundle created: %OUTFILE%
echo To use in production, replace the individual link tags with:
echo   ^<link rel="stylesheet" href="css/bundle.css"^>
echo.
pause