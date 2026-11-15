# StockEase Trivy Security Scan Script (PowerShell)
# Usage: .\monitoring\security\trivy-scan.ps1 [-ScanType all|backend|frontend|fs|config|secrets]
# Requires: trivy, docker

param(
  [ValidateSet("all","backend","frontend","fs","config","secrets")]
  [string]$ScanType = "all"
)

$BackendImage = "stockease-backend:latest"
$FrontendImage = "stockease-frontend:latest"
$ReportDir = "monitoring\security\reports"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

function Check-Trivy {
  try {
    $version = trivy --version 2>&1 | Select-Object -First 1
    Write-Host "✓ $version found" -ForegroundColor Green
  } catch {
    Write-Error "trivy not found. Install from https://trivy.dev/latest/getting-started/installation/"
    exit 1
  }
}

function Scan-Image {
  param([string]$Image, [string]$Name)
  Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host " Scanning image: $Image" -ForegroundColor Cyan
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  $outFile = "$ReportDir\${Name}_scan_$Timestamp.txt"
  trivy image --severity CRITICAL,HIGH --ignore-unfixed --format table $Image 2>&1 | Tee-Object -FilePath $outFile
}

function Scan-Filesystem {
  Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host " Scanning filesystem" -ForegroundColor Cyan
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  $outFile = "$ReportDir\filesystem_scan_$Timestamp.txt"
  trivy fs --severity CRITICAL,HIGH --ignore-unfixed --skip-dirs "node_modules,.git" --format table . 2>&1 | Tee-Object -FilePath $outFile
}

function Scan-Config {
  Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host " Scanning for misconfigurations" -ForegroundColor Cyan
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  $outFile = "$ReportDir\config_scan_$Timestamp.txt"
  trivy config --severity CRITICAL,HIGH --skip-dirs "node_modules,.git" --format table . 2>&1 | Tee-Object -FilePath $outFile
}

function Scan-Secrets {
  Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host " Scanning for exposed secrets" -ForegroundColor Cyan
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  $outFile = "$ReportDir\secrets_scan_$Timestamp.txt"
  trivy fs --scanners secret --skip-dirs "node_modules,.git" --format table . 2>&1 | Tee-Object -FilePath $outFile
}

Check-Trivy

switch ($ScanType) {
  "backend"  { Scan-Image $BackendImage "backend" }
  "frontend" { Scan-Image $FrontendImage "frontend" }
  "fs"       { Scan-Filesystem }
  "config"   { Scan-Config }
  "secrets"  { Scan-Secrets }
  default {
    Scan-Image $BackendImage "backend"
    Scan-Image $FrontendImage "frontend"
    Scan-Filesystem
    Scan-Config
    Scan-Secrets
    Write-Host "`n✓ All scans complete. Reports saved to $ReportDir\" -ForegroundColor Green
  }
}
