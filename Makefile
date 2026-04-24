# =============================================================================
# Makefile — Stackra Frontend Monorepo
# =============================================================================
#
# Convenient shortcuts for common development tasks.
# Run `make help` to see all available commands.
#
# Prerequisites:
#   - Node.js >= 18
#   - bun
#
# =============================================================================

.PHONY: help install dev build clean test lint format check deploy

.DEFAULT_GOAL := help

BLUE   := \033[0;34m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

## help: Display this help message
help:
	@echo "$(BLUE)Stackra Frontend Monorepo — Available Commands$(NC)"
	@echo ""
	@grep -E '^## [a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "## |:"}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$2, $$3}'

## install: Install all dependencies via bun
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install

## reset: Clean everything and reinstall from scratch
reset: clean-all install
	@echo "$(GREEN)Reset complete!$(NC)"

## dev: Start development servers for all apps
dev:
	@echo "$(BLUE)Starting development servers...$(NC)"
	bun run dev

## build: Build all packages and apps
build:
	@echo "$(BLUE)Building all packages and apps...$(NC)"
	bun run build

## build-packages: Build only library packages
build-packages:
	@echo "$(BLUE)Building packages...$(NC)"
	bun run build:packages

## build-apps: Build only deployable apps
build-apps:
	@echo "$(BLUE)Building apps...$(NC)"
	bun run build:apps

## test: Run all tests once
test:
	@echo "$(BLUE)Running tests...$(NC)"
	bun run test

## test-watch: Run tests in watch mode
test-watch:
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	bun run test:watch

## test-coverage: Run tests with coverage reports
test-coverage:
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	bun run test:coverage

## lint: Run ESLint on all packages
lint:
	@echo "$(BLUE)Running linter...$(NC)"
	bun run lint

## lint-fix: Run ESLint with auto-fix
lint-fix:
	@echo "$(BLUE)Running linter with auto-fix...$(NC)"
	bun run lint:fix

## format: Format all code with Prettier
format:
	@echo "$(BLUE)Formatting code...$(NC)"
	bun run format

## format-check: Check code formatting without modifying files
format-check:
	@echo "$(BLUE)Checking code formatting...$(NC)"
	bun run format:check

## check-types: Run TypeScript type checking
check-types:
	@echo "$(BLUE)Checking types...$(NC)"
	bun run check-types

## check: Run all quality checks (lint + format + types)
check: lint format-check check-types
	@echo "$(GREEN)All checks passed!$(NC)"

## validate: Full validation pipeline (lint + types + build)
validate:
	@echo "$(BLUE)Running full validation...$(NC)"
	bun run validate

## ci: Simulate CI pipeline locally
ci: lint check-types build test
	@echo "$(GREEN)CI checks passed!$(NC)"

## clean: Clean all build artifacts and turbo cache
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	bun run clean

## clean-all: Nuclear clean — removes node_modules, dist, .turbo
clean-all:
	@echo "$(RED)Cleaning everything...$(NC)"
	bun run clean:deps
	rm -rf .turbo

## changeset: Create a new changeset for versioning
changeset:
	@echo "$(BLUE)Creating changeset...$(NC)"
	bun run changeset

## version: Apply changesets and bump package versions
version:
	@echo "$(BLUE)Versioning packages...$(NC)"
	bun run changeset:version

## release: Build all packages and publish to npm
release:
	@echo "$(BLUE)Releasing packages...$(NC)"
	bun run release

## graph: Generate the turbo dependency graph
graph:
	@echo "$(BLUE)Generating dependency graph...$(NC)"
	bun run graph
	@echo "$(GREEN)Graph saved to dependency-graph.html$(NC)"

## info: Display project and environment information
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Node: $$(node --version)"
	@echo "  Bun:  $$(bun --version)"
	@echo "  Turbo: $$(bun turbo --version 2>/dev/null || echo 'not installed')"
