# PowerShell script to remove duplicate apiClient import lines
$ErrorActionPreference = "Stop"

Write-Host "🧹 Cleaning duplicate apiClient imports..." -ForegroundColor Cyan

# Find all .tsx and .ts files
$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx, *.ts

$fixedCount = 0
$skippedCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
       
        # Count how many times the import appears
        $importPattern = "import apiClient from ['""].+api/client['""];"
        $matches = [regex]::Matches($content, $importPattern)
       
        if ($matches.Count -gt 1) {
            Write-Host "Fixing: $($file.FullName)" -ForegroundColor Yellow
           
            # Keep only the first occurrence, remove all others
            $lines = Get-Content -Path $file.FullName -Encoding UTF8
            $newLines = @()
            $foundFirst = $false
           
            foreach ($line in $lines) {
                if ($line -match $importPattern) {
                    if (-not $foundFirst) {
                        $newLines += $line
                        $foundFirst = $true
                    }
                    # Skip duplicate lines
                }
                else {
                    $newLines += $line
                }
            }
           
            # Write back to file
            $newLines | Set-Content -Path $file.FullName -Encoding UTF8
           
            Write-Host "✅ Fixed: $($file.Name) (removed $($matches.Count - 1) duplicates)" -ForegroundColor Green
            $fixedCount++
        }
    }
    catch {
        Write-Host "❌ Error processing $($file.Name): $_" -ForegroundColor Red
        $skippedCount++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "`n🎉 Cleanup complete!" -ForegroundColor Cyan
