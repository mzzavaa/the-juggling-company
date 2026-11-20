# The Juggling Company - project commands
# Run `make` or `make help` to list everything. Requires Node + npm.

SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help install dev build preview check typecheck format linkcheck posters anim clean clean-all

help: ## List all available commands
	@echo "The Juggling Company - available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-13s %s\n", $$1, $$2}'

install: ## Install dependencies cleanly from package-lock.json
	npm ci

dev: ## Start the dev server at http://localhost:4321
	npm run dev

build: ## Production build to dist/ (astro build)
	npm run build

preview: ## Serve the built dist/ locally
	npm run preview

check: typecheck build ## Typecheck and build - full verification

typecheck: ## Run astro check (type + Zod content validation)
	npm run typecheck

format: ## Format src files with Prettier
	npm run format

linkcheck: build ## Build, then scan dist/ for broken links (needs lychee)
	npm run linkcheck

posters: ## Generate video poster images
	npm run posters

anim: ## Re-render the pattern GIFs with the Juggling Lab desktop app (needs Juggling Lab + ffmpeg)
	npm run anim:render

clean: ## Remove the build output (dist/)
	rm -rf dist

clean-all: clean ## Remove dist/ and node_modules/
	rm -rf node_modules
