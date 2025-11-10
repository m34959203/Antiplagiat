# ============================================
# Project Files Collection Script
# ============================================

param(
    [string]$OutputFile = "PROJECT-COLLECTION-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
)

$ErrorActionPreference = "Continue"

# Exclude folders
$excludeFolders = @(
    'node_modules',
    '__pycache__',
    '.next',
    'dist',
    'build',
    '.git',
    '.venv',
    'venv',
    'env',
    '.pytest_cache',
    '.mypy_cache',
    'coverage',
    '.idea',
    '.vscode'
)

# Exclude files
$excludeFiles = @(
    '*.pyc',
    '*.pyo',
    '*.log',
    '*.exe',
    '*.dll',
    '*.so',
    '*.dylib',
    'package-lock.json',
    'poetry.lock',
    '.DS_Store',
    'Thumbs.db',
    '*.backup_*'
)

# Never include these files
$excludeExact = @(
    '.env',
    '.env.local'
)

# Include these extensions
$includeExtensions = @(
    '.py', '.go', '.mod', '.sum',
    '.js', '.jsx', '.ts', '.tsx', '.json',
    '.yml', '.yaml', '.toml', '.env.example',
    '.md', '.txt',
    '.ps1', '.sh', '.bat',
    '.html', '.css'
)

# ============================================
# Functions
# ============================================

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Get-RelativePath {
    param([string]$Path, [string]$BasePath)
    return $Path.Replace($BasePath, "").TrimStart('\')
}

function Should-ExcludeFolder {
    param([string]$FolderPath)
    
    foreach ($exclude in $excludeFolders) {
        if ($FolderPath -like "*\$exclude" -or $FolderPath -like "*\$exclude\*") {
            return $true
        }
    }
    return $false
}

function Should-ExcludeFile {
    param([string]$FileName)
    
    if ($excludeExact -contains $FileName) {
        return $true
    }
    
    foreach ($pattern in $excludeFiles) {
        if ($FileName -like $pattern) {
            return $true
        }
    }
    
    return $false
}

function Should-IncludeFile {
    param([string]$FileName)
    
    $ext = [System.IO.Path]::GetExtension($FileName).ToLower()
    return $includeExtensions -contains $ext
}

# ============================================
# Main Process
# ============================================

Write-ColorOutput "`n============================================" "Cyan"
Write-ColorOutput "   PROJECT FILES COLLECTION" "Cyan"
Write-ColorOutput "============================================`n" "Cyan"

$startTime = Get-Date
$rootPath = Get-Location
$output = @()

# Header
$output += "=" * 80
$output += "PROJECT AUDIT: ANTIPLAGIAT"
$output += "=" * 80
$output += "Collection Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$output += "Root Path: $rootPath"
$output += "=" * 80
$output += ""

# ============================================
# Collect Project Structure
# ============================================

Write-ColorOutput "Analyzing project structure..." "Yellow"

$output += "PROJECT STRUCTURE"
$output += "-" * 80

try {
    $treeOutput = tree /F /A | Out-String
    $output += $treeOutput
} catch {
    $output += "Error getting tree structure: $($_.Exception.Message)"
}

$output += ""

# ============================================
# Collect Files
# ============================================

Write-ColorOutput "Collecting files..." "Yellow"

$allFiles = Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $file = $_
    
    # Exclude folders
    if (Should-ExcludeFolder -FolderPath $file.DirectoryName) {
        return $false
    }
    
    # Exclude files
    if (Should-ExcludeFile -FileName $file.Name) {
        return $false
    }
    
    # Include only specific extensions
    return Should-IncludeFile -FileName $file.Name
}

Write-ColorOutput "Found files: $($allFiles.Count)" "Green"

# ============================================
# Statistics
# ============================================

$stats = @{
    TotalFiles = $allFiles.Count
    TotalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum
    ByExtension = @{}
}

foreach ($file in $allFiles) {
    $ext = [System.IO.Path]::GetExtension($file.Name)
    if (-not $stats.ByExtension.ContainsKey($ext)) {
        $stats.ByExtension[$ext] = 0
    }
    $stats.ByExtension[$ext]++
}

$output += "PROJECT STATISTICS"
$output += "-" * 80
$output += "Total files: $($stats.TotalFiles)"
$output += "Total size: $([math]::Round($stats.TotalSize / 1KB, 2)) KB"
$output += ""

$output += "By file type:"
foreach ($ext in ($stats.ByExtension.GetEnumerator() | Sort-Object Value -Descending)) {
    $output += "  $($ext.Key): $($ext.Value) files"
}
$output += ""
$output += ""

# ============================================
# File Contents
# ============================================

Write-ColorOutput "Collecting file contents..." "Yellow"

$output += "=" * 80
$output += "FILE CONTENTS"
$output += "=" * 80
$output += ""

$fileCount = 0
foreach ($file in ($allFiles | Sort-Object FullName)) {
    $fileCount++
    $relativePath = Get-RelativePath -Path $file.FullName -BasePath $rootPath
    
    Write-Progress -Activity "Processing files" -Status $relativePath -PercentComplete (($fileCount / $allFiles.Count) * 100)
    
    $output += "=" * 80
    $output += "FILE: $relativePath"
    $output += "Size: $($file.Length) bytes | Modified: $($file.LastWriteTime)"
    $output += "=" * 80
    $output += ""
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        if ([string]::IsNullOrWhiteSpace($content)) {
            $output += "(empty file)"
        } else {
            $output += $content
        }
    }
    catch {
        $output += "ERROR READING FILE: $($_.Exception.Message)"
    }
    
    $output += ""
    $output += ""
}

# ============================================
# Checks and Recommendations
# ============================================

$output += "=" * 80
$output += "CHECKS AND RECOMMENDATIONS"
$output += "=" * 80
$output += ""

# Check for .env files
$envFiles = Get-ChildItem -Path $rootPath -Recurse -Filter ".env" -File -ErrorAction SilentlyContinue
if ($envFiles) {
    $output += "WARNING: Found .env files (not included in collection):"
    foreach ($env in $envFiles) {
        $output += "   - " + (Get-RelativePath -Path $env.FullName -BasePath $rootPath)
    }
    $output += ""
}

# Check for .env.example
$envExamples = Get-ChildItem -Path $rootPath -Recurse -Filter ".env.example" -File -ErrorAction SilentlyContinue
if ($envExamples.Count -eq 0) {
    $output += "RECOMMENDATION: Create .env.example files"
    $output += ""
}

# Check for README
$readme = Get-ChildItem -Path $rootPath -Filter "README.md" -File -ErrorAction SilentlyContinue
if (-not $readme) {
    $output += "RECOMMENDATION: Create README.md in project root"
    $output += ""
}

# Check dependencies
$hasPyRequirements = Get-ChildItem -Path $rootPath -Recurse -Filter "requirements.txt" -File -ErrorAction SilentlyContinue
$hasPackageJson = Get-ChildItem -Path $rootPath -Recurse -Filter "package.json" -File -ErrorAction SilentlyContinue

if ($hasPyRequirements) {
    $output += "OK: Python dependencies (requirements.txt) found"
}
if ($hasPackageJson) {
    $output += "OK: Node.js dependencies (package.json) found"
}
$output += ""

# ============================================
# Save Results
# ============================================

Write-ColorOutput "`nSaving results..." "Yellow"

$output | Out-File -FilePath $OutputFile -Encoding UTF8

$endTime = Get-Date
$duration = $endTime - $startTime

# ============================================
# Complete
# ============================================

Write-ColorOutput "`n============================================" "Green"
Write-ColorOutput "   COLLECTION COMPLETE!" "Green"
Write-ColorOutput "============================================" "Green"
Write-ColorOutput "`nOutput file: $OutputFile" "Cyan"
Write-ColorOutput "File size: $([math]::Round((Get-Item $OutputFile).Length / 1KB, 2)) KB" "Cyan"
Write-ColorOutput "Duration: $($duration.TotalSeconds) seconds" "Cyan"
Write-ColorOutput "Files processed: $($allFiles.Count)" "Cyan"
Write-ColorOutput "`nYou can send this file for audit!`n" "Yellow"

# Open file?
$open = Read-Host "Open file? (y/n)"
if ($open -eq 'y') {
    notepad $OutputFile
}