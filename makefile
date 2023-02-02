install:
	npm ci
lint:
	npx eslint .
lint-fix:
	npx eslint . --fix
develop:
	npx webpack serve
build:
	NODE_ENV=production npx webpack