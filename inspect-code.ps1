# ============================================================================
# СКРИПТ ИНСПЕКЦИИ КОДА - ПОИСК ОШИБОК В ЛОГИКЕ
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  🔍 ИНСПЕКЦИЯ ПРОЕКТА ANTIPLAGIAT" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$reportFile = "CODE_INSPECTION_REPORT.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Создаем отчет
@"
================================================================================
         🔍 CODE INSPECTION REPORT
         Дата: $timestamp
================================================================================

ЦЕЛЬ: Найти ошибку в расчете оригинальности
ПРОБЛЕМА: Совпадение 95%, но оригинальность 93.2%

================================================================================
"@ | Out-File $reportFile -Encoding UTF8

# ============================================================================
# ФУНКЦИЯ: Анализ файла
# ============================================================================
function Inspect-File {
    param(
        [string]$Path,
        [string]$Description,
        [string]$FocusOn = ""
    )
    
    if (Test-Path $Path) {
        "`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
        "FILE: $Description" | Out-File $reportFile -Append -Encoding UTF8
        "PATH: $Path" | Out-File $reportFile -Append -Encoding UTF8
        "="*80 | Out-File $reportFile -Append -Encoding UTF8
        
        $content = Get-Content $Path -Raw -Encoding UTF8
        
        if ($FocusOn) {
            "`n>>> ФОКУС НА: $FocusOn <<<`n" | Out-File $reportFile -Append -Encoding UTF8
            
            # Извлекаем нужную функцию/метод
            $lines = $content -split "`n"
            $inFunction = $false
            $functionContent = @()
            $indent = 0
            
            foreach ($line in $lines) {
                if ($line -match $FocusOn) {
                    $inFunction = $true
                    $indent = ($line -replace '\S.*$', '').Length
                }
                
                if ($inFunction) {
                    $functionContent += $line
                    
                    # Проверяем окончание функции (по отступу)
                    if ($line.Trim() -and 
                        ($line -replace '\S.*$', '').Length -le $indent -and 
                        $functionContent.Count -gt 5 -and 
                        $line -notmatch '^\s*$') {
                        
                        if ($line -notmatch $FocusOn) {
                            break
                        }
                    }
                }
            }
            
            $functionContent -join "`n" | Out-File $reportFile -Append -Encoding UTF8
        } else {
            $content | Out-File $reportFile -Append -Encoding UTF8
        }
        
        Write-Host "  ✓ $Description" -ForegroundColor Green
        
    } else {
        "`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
        "FILE: $Description - NOT FOUND!" | Out-File $reportFile -Append -Encoding UTF8
        "PATH: $Path" | Out-File $reportFile -Append -Encoding UTF8
        "="*80 | Out-File $reportFile -Append -Encoding UTF8
        
        Write-Host "  ✗ $Description - НЕ НАЙДЕН" -ForegroundColor Red
    }
}

# ============================================================================
# BACKEND - КРИТИЧЕСКИЕ ФАЙЛЫ
# ============================================================================
Write-Host "`n🔥 BACKEND - ЛОГИКА ДЕТЕКЦИИ:" -ForegroundColor Yellow

Inspect-File `
    -Path "backend\public-api\app\services\detector.py" `
    -Description "DETECTOR.PY - Алгоритм детекции" `
    -FocusOn "def _google_search_analysis"

Inspect-File `
    -Path "backend\public-api\app\main.py" `
    -Description "MAIN.PY - FastAPI endpoints" `
    -FocusOn "async def create_check"

Inspect-File `
    -Path "backend\public-api\app\models.py" `
    -Description "MODELS.PY - Database models"

Inspect-File `
    -Path "backend\public-api\app\core\config.py" `
    -Description "CONFIG.PY - Configuration"

Inspect-File `
    -Path "backend\public-api\requirements.txt" `
    -Description "REQUIREMENTS.TXT - Dependencies"

# ============================================================================
# FRONTEND - ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ
# ============================================================================
Write-Host "`n🎨 FRONTEND - ОТОБРАЖЕНИЕ:" -ForegroundColor Yellow

Inspect-File `
    -Path "frontend\app\report\[id]\page.tsx" `
    -Description "REPORT PAGE - Страница результатов"

Inspect-File `
    -Path "frontend\lib\api.ts" `
    -Description "API CLIENT - Frontend API"

Inspect-File `
    -Path "frontend\app\page.tsx" `
    -Description "HOME PAGE - Главная страница"

# ============================================================================
# АНАЛИЗ ЛОГИКИ
# ============================================================================
Write-Host "`n🔬 АНАЛИЗ ЛОГИКИ РАСЧЕТА:" -ForegroundColor Yellow

"`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
"🔬 АНАЛИЗ РАСЧЕТА ОРИГИНАЛЬНОСТИ" | Out-File $reportFile -Append -Encoding UTF8
"="*80 | Out-File $reportFile -Append -Encoding UTF8

$detectorContent = Get-Content "backend\public-api\app\services\detector.py" -Raw -Encoding UTF8

# Ищем логику расчета
$calculations = @()
if ($detectorContent -match '(?s)# Рассчитываем оригинальность.*?return \{') {
    $calculations += $matches[0]
}

if ($calculations.Count -gt 0) {
    "`nНАЙДЕНА ЛОГИКА РАСЧЕТА:" | Out-File $reportFile -Append -Encoding UTF8
    $calculations -join "`n`n" | Out-File $reportFile -Append -Encoding UTF8
} else {
    "`nЛОГИКА РАСЧЕТА НЕ НАЙДЕНА!" | Out-File $reportFile -Append -Encoding UTF8
}

# Поиск всех мест где используется "originality"
"`n`nВСЕ УПОМИНАНИЯ 'originality':" | Out-File $reportFile -Append -Encoding UTF8
$detectorContent -split "`n" | Select-String "originality" | ForEach-Object {
    "  $_" | Out-File $reportFile -Append -Encoding UTF8
}

# ============================================================================
# КОНФИГУРАЦИЯ
# ============================================================================
Write-Host "`n⚙️  КОНФИГУРАЦИЯ:" -ForegroundColor Yellow

Inspect-File `
    -Path ".env.example" `
    -Description "ENV EXAMPLE"

Inspect-File `
    -Path "backend\public-api\.env" `
    -Description "BACKEND ENV (ПРОВЕРЬТЕ СЕКРЕТЫ!)"

Inspect-File `
    -Path "render.yaml" `
    -Description "RENDER CONFIG"

# ============================================================================
# СТАТИСТИКА
# ============================================================================
Write-Host "`n📊 СТАТИСТИКА КОДА:" -ForegroundColor Yellow

"`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
"📊 СТАТИСТИКА ПРОЕКТА" | Out-File $reportFile -Append -Encoding UTF8
"="*80 | Out-File $reportFile -Append -Encoding UTF8

$stats = @{
    "Python файлов" = (Get-ChildItem -Recurse -Filter "*.py" -File).Count
    "TypeScript файлов" = (Get-ChildItem -Recurse -Filter "*.tsx","*.ts" -File).Count
    "Строк в detector.py" = (Get-Content "backend\public-api\app\services\detector.py" -Encoding UTF8 | Measure-Object -Line).Lines
    "Строк в main.py" = (Get-Content "backend\public-api\app\main.py" -Encoding UTF8 | Measure-Object -Line).Lines
}

foreach ($key in $stats.Keys) {
    "$key : $($stats[$key])" | Out-File $reportFile -Append -Encoding UTF8
}

# ============================================================================
# ПОИСК ПОДОЗРИТЕЛЬНЫХ ПАТТЕРНОВ
# ============================================================================
Write-Host "`n🚨 ПОИСК ОШИБОК:" -ForegroundColor Yellow

"`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
"🚨 ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ" | Out-File $reportFile -Append -Encoding UTF8
"="*80 | Out-File $reportFile -Append -Encoding UTF8

$issues = @()

# Проверка 1: Расчет оригинальности
if ($detectorContent -match "matched_chars / total_chars") {
    $issues += "✓ Найдена формула: matched_chars / total_chars"
} else {
    $issues += "✗ ПРОБЛЕМА: Формула расчета не найдена!"
}

# Проверка 2: Умножение на 100
if ($detectorContent -match "\* 100") {
    $issues += "✓ Найдено умножение на 100 для процентов"
}

# Проверка 3: Проверка границ (0-100)
if ($detectorContent -match "max\(0,|min\(100,") {
    $issues += "✓ Есть проверка границ (0-100)"
} else {
    $issues += "⚠ Нет проверки границ результата"
}

# Проверка 4: Round
if ($detectorContent -match "round\(") {
    $issues += "✓ Результат округляется"
}

$issues | ForEach-Object {
    $_ | Out-File $reportFile -Append -Encoding UTF8
}

# ============================================================================
# ЗАВЕРШЕНИЕ
# ============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "  ✅ ИНСПЕКЦИЯ ЗАВЕРШЕНА" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""
Write-Host "Отчет сохранен: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Yellow
Write-Host "  1. Откройте отчет: notepad $reportFile" -ForegroundColor White
Write-Host "  2. Найдите раздел 'ЛОГИКА РАСЧЕТА'" -ForegroundColor White
Write-Host "  3. Проверьте формулу оригинальности" -ForegroundColor White
Write-Host ""

"`n" + "="*80 | Out-File $reportFile -Append -Encoding UTF8
"END OF REPORT" | Out-File $reportFile -Append -Encoding UTF8
"="*80 | Out-File $reportFile -Append -Encoding UTF8

# Открыть отчет?
$open = Read-Host "Открыть отчет в блокноте? (y/n)"
if ($open -eq "y") {
    notepad $reportFile
}