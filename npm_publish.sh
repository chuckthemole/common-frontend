#!/bin/bash

# Usage: ./npm_publish.sh [patch|minor|major]
# Default is 'patch' if no argument is provided

set -e

BUMP_TYPE=${1:-patch}

echo "Bumping $BUMP_TYPE version..."
npm version $BUMP_TYPE

echo "Running build..."
npm run build

echo "Publishing to npm (public)..."
npm publish --access public

echo "✅ Published successfully!"
