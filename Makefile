develop:
	npx webpack serve

install:
	npm install

build:
	npm run build

test:
	npm test

lint:
	npx eslint --fix .

.PHONY: test