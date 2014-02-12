test: install
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--timeout 300 \
		--require should \
		--growl \
		test/test.js

install:
	npm install

.PHONY: test