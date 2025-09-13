#!/bin/bash

# Remove CRA boilerplate files we don't use
echo "Cleaning up CRA boilerplate..."

rm -f src/App.css
rm -f src/App.test.js
rm -f src/index.css
rm -f src/logo.svg
rm -f src/reportWebVitals.js
rm -f src/setupTests.js

echo "Cleanup complete"
