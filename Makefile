# =============================================================================
# Makefile — Stackra Frontend Monorepo
# =============================================================================
#
# Convenient shortcuts for common development tasks.
# Run `make help` to see all available commands.
#
# Prerequisites:
#   - Node.js >= 18
#   - npm
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

## install: Install all dependencies via npm
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

## reset: Clean everything and reinstall from scratch
reset: clean-all install
	@echo "$(GREEN)Reset complete!$(NC)"

## dev: Start development servers for all apps
dev:
	@echo "$(BLUE)Starting development servers...$(NC)"
	npm run dev

## build: Build all packages and apps
build:
	@echo "$(BLUE)Building all packages and apps...$(NC)"
	npm run build

## build-packages: Build only library packages
build-packages:
	@echo "$(BLUE)Building packages...$(NC)"
	npm run build:packages

## build-apps: Build only deployable apps
build-apps:
	@echo "$(BLUE)Building apps...$(NC)"
	npm run build:apps

## test: Run all tests once
test:
	@echo "$(BLUE)Running tests...$(NC)"
	npm run test

## test-watch: Run tests in watch mode
test-watch:
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	npm run test:watch

## test-coverage: Run tests with coverage reports
test-coverage:
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	npm run test:coverage

## lint: Run ESLint on all packages
lint:
	@echo "$(BLUE)Running linter...$(NC)"
	npm run lint

## lint-fix: Run ESLint with auto-fix
lint-fix:
	@echo "$(BLUE)Running linter with auto-fix...$(NC)"
	npm run lint:fix

## format: Format all code with Prettier
format:
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

## format-check: Check code formatting without modifying files
format-check:
	@echo "$(BLUE)Checking code formatting...$(NC)"
	npm run format:check

## check-types: Run TypeScript type checking
check-types:
	@echo "$(BLUE)Checking types...$(NC)"
	npm run check-types

## check: Run all quality checks (lint + format + types)
check: lint format-check check-types
	@echo "$(GREEN)All checks passed!$(NC)"

## validate: Full validation pipeline (lint + types + build)
validate:
	@echo "$(BLUE)Running full validation...$(NC)"
	npm run validate

## ci: Simulate CI pipeline locally
ci: lint check-types build test
	@echo "$(GREEN)CI checks passed!$(NC)"

## clean: Clean all build artifacts and turbo cache
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	npm run clean

## clean-all: Nuclear clean — removes node_modules, dist, .turbo
clean-all:
	@echo "$(RED)Cleaning everything...$(NC)"
	npm run clean:deps
	rm -rf .turbo

## changeset: Create a new changeset for versioning
changeset:
	@echo "$(BLUE)Creating changeset...$(NC)"
	npm run changeset

## version: Apply changesets and bump package versions
version:
	@echo "$(BLUE)Versioning packages...$(NC)"
	npm run changeset:version

## release: Build all packages and publish to npm
release:
	@echo "$(BLUE)Releasing packages...$(NC)"
	npm run release

## graph: Generate the turbo dependency graph
graph:
	@echo "$(BLUE)Generating dependency graph...$(NC)"
	npm run graph
	@echo "$(GREEN)Graph saved to dependency-graph.html$(NC)"

## info: Display project and environment information
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Node: $$(node --version)"
	@echo "  npm:  $$(npm --version)"
	@echo "  Turbo: $$(npx turbo --version 2>/dev/null || echo 'not installed')"
