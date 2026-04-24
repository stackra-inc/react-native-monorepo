#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# cleanup.sh — Monorepo cleanup utility
#
# Usage:
#   ./scripts/cleanup.sh          # default: clean build artifacts
#   ./scripts/cleanup.sh build    # remove dist, .next, release, coverage
#   ./scripts/cleanup.sh cache    # remove turbo cache, tsbuildinfo, .cache
#   ./scripts/cleanup.sh deps     # remove all node_modules + lockfile
#   ./scripts/cleanup.sh all      # everything: build + cache + deps + turbo
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-build}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "  → $1"; }

remove_dirs() {
    local pattern="$1"
    local label="$2"
    local count=0

    while IFS= read -r -d '' dir; do
        rm -rf "$dir"
        ((count++))
    done < <(find "$ROOT" -name "$pattern" -type d -not -path '*/node_modules/*' -prune -print0 2>/dev/null)

    if [ "$count" -gt 0 ]; then
        log "Removed ${count} ${label} directories"
    fi
}

remove_files() {
    local pattern="$1"
    local label="$2"
    local count=0

    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((count++))
    done < <(find "$ROOT" -name "$pattern" -type f -not -path '*/node_modules/*' -print0 2>/dev/null)

    if [ "$count" -gt 0 ]; then
        log "Removed ${count} ${label} files"
    fi
}

# ── Build artifacts ───────────────────────────────────────────────────
clean_build() {
    echo "Cleaning build artifacts..."
    remove_dirs "dist" "dist"
    remove_dirs ".next" ".next"
    remove_dirs "release" "release"
    remove_dirs "coverage" "coverage"
    remove_dirs "storybook-static" "storybook-static"
    remove_dirs ".output" ".output"
    remove_files "*.tsbuildinfo" "tsbuildinfo"
}

# ── Caches ────────────────────────────────────────────────────────────
clean_cache() {
    echo "Cleaning caches..."

    # Turbo cache
    if [ -d "$ROOT/.turbo" ]; then
        rm -rf "$ROOT/.turbo"
        log "Removed root .turbo"
    fi

    remove_dirs ".turbo" ".turbo"
    remove_dirs ".cache" ".cache"
    remove_dirs ".eslintcache" ".eslintcache"
    remove_files "*.tsbuildinfo" "tsbuildinfo"
    remove_files ".eslintcache" "eslintcache"

    # Turbo daemon
    if command -v turbo &>/dev/null; then
        turbo clean 2>/dev/null && log "Turbo cache cleared" || true
    fi
}

# ── Dependencies ──────────────────────────────────────────────────────
clean_deps() {
    echo "Cleaning dependencies..."

    # Remove all node_modules (including nested)
    local count=0
    while IFS= read -r -d '' dir; do
        rm -rf "$dir"
        ((count++))
    done < <(find "$ROOT" -name "node_modules" -type d -prune -print0 2>/dev/null)

    if [ "$count" -gt 0 ]; then
        log "Removed ${count} node_modules directories"
    fi

    # Remove lockfile
    if [ -f "$ROOT/pnpm-lock.yaml" ]; then
        rm -f "$ROOT/pnpm-lock.yaml"
        log "Removed pnpm-lock.yaml"
    fi
}

# ── Temp / OS files ───────────────────────────────────────────────────
clean_tmp() {
    echo "Cleaning temp files..."
    remove_files ".DS_Store" ".DS_Store"
    remove_files "Thumbs.db" "Thumbs.db"
    remove_dirs ".tmp" ".tmp"
    remove_dirs "tmp" "tmp"
}

# ── Execute ───────────────────────────────────────────────────────────
echo ""
echo "🧹 Monorepo Cleanup (mode: ${MODE})"
echo "─────────────────────────────────────"

case "$MODE" in
    build)
        clean_build
        ;;
    cache)
        clean_cache
        ;;
    deps)
        clean_deps
        ;;
    all)
        clean_build
        clean_cache
        clean_tmp
        clean_deps
        ;;
    *)
        echo -e "${RED}Unknown mode: ${MODE}${NC}"
        echo "Usage: cleanup.sh [build|cache|deps|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done.${NC}"
