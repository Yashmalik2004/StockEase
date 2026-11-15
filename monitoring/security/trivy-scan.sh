#!/bin/bash
# StockEase Trivy Security Scan Script
# Usage: ./monitoring/security/trivy-scan.sh [all|backend|frontend|fs|config]
# Requires: trivy, docker

set -e

BACKEND_IMAGE="stockease-backend:latest"
FRONTEND_IMAGE="stockease-frontend:latest"
REPORT_DIR="monitoring/security/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$REPORT_DIR"

check_trivy() {
  if ! command -v trivy &> /dev/null; then
    echo "ERROR: trivy not found. Install from https://trivy.dev/latest/getting-started/installation/"
    exit 1
  fi
  echo "✓ Trivy $(trivy --version | head -1) found"
}

scan_image() {
  local image=$1
  local name=$2
  echo ""
  echo "════════════════════════════════════════"
  echo " Scanning image: $image"
  echo "════════════════════════════════════════"
  trivy image \
    --severity CRITICAL,HIGH \
    --ignore-unfixed \
    --format table \
    "$image" 2>&1 | tee "$REPORT_DIR/${name}_scan_${TIMESTAMP}.txt"
}

scan_filesystem() {
  echo ""
  echo "════════════════════════════════════════"
  echo " Scanning filesystem for vulnerabilities"
  echo "════════════════════════════════════════"
  trivy fs \
    --severity CRITICAL,HIGH \
    --ignore-unfixed \
    --skip-dirs node_modules,.git \
    --format table \
    . 2>&1 | tee "$REPORT_DIR/filesystem_scan_${TIMESTAMP}.txt"
}

scan_config() {
  echo ""
  echo "════════════════════════════════════════"
  echo " Scanning for misconfigurations"
  echo "════════════════════════════════════════"
  trivy config \
    --severity CRITICAL,HIGH \
    --skip-dirs node_modules,.git \
    --format table \
    . 2>&1 | tee "$REPORT_DIR/config_scan_${TIMESTAMP}.txt"
}

scan_secrets() {
  echo ""
  echo "════════════════════════════════════════"
  echo " Scanning for exposed secrets"
  echo "════════════════════════════════════════"
  trivy fs \
    --scanners secret \
    --skip-dirs node_modules,.git \
    --format table \
    . 2>&1 | tee "$REPORT_DIR/secrets_scan_${TIMESTAMP}.txt"
}

check_trivy

SCAN_TYPE=${1:-all}

case $SCAN_TYPE in
  backend)
    scan_image "$BACKEND_IMAGE" "backend"
    ;;
  frontend)
    scan_image "$FRONTEND_IMAGE" "frontend"
    ;;
  fs)
    scan_filesystem
    ;;
  config)
    scan_config
    ;;
  secrets)
    scan_secrets
    ;;
  all|*)
    scan_image "$BACKEND_IMAGE" "backend"
    scan_image "$FRONTEND_IMAGE" "frontend"
    scan_filesystem
    scan_config
    scan_secrets
    echo ""
    echo "✓ All scans complete. Reports saved to $REPORT_DIR/"
    ;;
esac
