# PowerShell script to refactor hardcoded URLs to use apiClient
# Usage: Run this from the Frontend directory

$ErrorActionPreference = "Stop"

Write-Host "🔧 Starting URL refactoring..." -ForegroundColor Cyan

# Files to refactor (excluding already done)
$filesToRefactor = @(
    "src/pages/Dashboard/Nomina/DashboardNomina.tsx",
    "src/components/Vista_ArchivosExport/VistaArchivoExportNomina.tsx",
    "src/components/Vista_ArchivosExport/VistaArchivoExportTienda.tsx",
    "src/components/ResMasiv/VistaArchivoExportNomina.tsx",
    "src/components/Form_Solicitudes/FormHorasExt.tsx",
    "src/components/Form_Solicitudes/FormOtroSiTemp.tsx",
    "src/components/Form_Solicitudes/FormVacaciones.tsx",
    "src/components/Form_Solicitudes/FormBasico.tsx",
    "src/components/Form_VistaPrev/Tienda/FormMasivo.tsx",
    "src/components/Form_VistaPrev/Nomina/FormMasivoNom.tsx",
    "src/components/Form_VistaPrev/FormIndividual.tsx",
    "src/components/Form_Filtros/Filtros_Nomina/FiltrosNominaPen.tsx",
    "src/components/Form_Filtros/Filtros_Nomina/FiltrosNominaTien.tsx",
    "src/components/Form_Filtros/Filtros_Nomina/FiltrosNomResM.tsx",
    "src/components/Form_Filtros/Filtros_Nomina/FiltrosNominaTod.tsx",
    "src/components/Form_Filtros/Filtro_Tiendas/FiltrosExportConsTienda.tsx",
    "src/components/Form_Filtros/Filtros_Nomina/FiltrosNominaCons.tsx",
    "src/components/Box_Novedades/novedades.tsx",
    "src/components/Box_Novedades/Novedades_Nomina/NovNomPendientes.tsx",
    "src/components/Box_Novedades/Novedades_Nomina/NovNomTodas.tsx",
    "src/components/Box_Novedades/Novedades_Nomina/NovNomTiendas.tsx",
    "src/components/Form_Solicitudes/FormMasivo.tsx"
)

$successCount = 0
$errorCount = 0

foreach ($file in $filesToRefactor) {
    $filePath = Join-Path -Path $PSScriptRoot -ChildPath $file
   
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        $errorCount++
        continue
    }
   
    try {
        Write-Host "Processing: $file" -ForegroundColor Gray
       
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
       
        # Step 1: Add import if not exists
        if ($content -notmatch "import apiClient from") {
            # Find axios import and replace/append
            if ($content -match "import axios from 'axios';") {
                $content = $content -replace "import axios from 'axios';", "import axios from 'axios';`nimport apiClient from '../../api/client';"
            } else {
                # Add after first import
                $content = $content -replace "(import .+ from .+;)", "`$1`nimport apiClient from '../../api/client';"
            }
        }
       
        # Step 2: Replace URLs
        $content = $content -replace "axios\.get\('http://localhost:3000/", "apiClient.get('/"
        $content = $content -replace "axios\.post\('http://localhost:3000/", "apiClient.post('/"
        $content = $content -replace "axios\.put\('http://localhost:3000/", "apiClient.put('/"
        $content = $content -replace "axios\.patch\('http://localhost:3000/", "apiClient.patch('/"
        $content = $content -replace "axios\.delete\('http://localhost:3000/", "apiClient.delete('/"
        $content = $content -replace 'axios\.get\("http://localhost:3000/', 'apiClient.get("/'
        $content = $content -replace 'axios\.post\("http://localhost:3000/', 'apiClient.post("/'
        $content = $content -replace 'axios\.put\("http://localhost:3000/', 'apiClient.put("/'
        $content = $content -replace 'axios\.patch\("http://localhost:3000/', 'apiClient.patch("/'
        $content = $content -replace 'axios\.delete\("http://localhost:3000/', 'apiClient.delete("/'
       
        # Step 3: Replace template literals
        $content = $content -replace 'axios\.get\(`http://localhost:3000/', 'apiClient.get(`/'
        $content = $content -replace 'axios\.post\(`http://localhost:3000/', 'apiClient.post(`/'
        $content = $content -replace 'axios\.put\(`http://localhost:3000/', 'apiClient.put(`/'
        $content = $content -replace 'axios\.patch\(`http://localhost:3000/', 'apiClient.patch(`/'
        $content = $content -replace 'axios\.delete\(`http://localhost:3000/', 'apiClient.delete(`/'
       
        # Step 4: Save file
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
       
        Write-Host "✅ $file" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ Error processing $file : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount files" -ForegroundColor Green
Write-Host "❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "`n🎉 Refactoring complete!" -ForegroundColor Cyan
