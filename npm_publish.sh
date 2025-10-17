#!/bin/bash
# =====================================================================
# npm_publish.sh
# ---------------------------------------------------------------------
# A safe, production-ready script for bumping the NPM package version,
# building the project, and publishing it to NPM.
#
# Usage:
#   ./npm_publish.sh [patch|minor|major]
#   - If no argument is provided, the script will prompt the user.
#
# Example:
#   ./npm_publish.sh          # prompts user (default = patch)
#   ./npm_publish.sh minor    # bumps minor version automatically
# =====================================================================

set -e  # Exit immediately on error

# ------------------------------
# Helper: print a message in color
# ------------------------------
function info {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

function success {
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

function error {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# ------------------------------
# Step 1: Get current version
# ------------------------------
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Current package version: $CURRENT_VERSION"

# ------------------------------
# Step 2: Determine bump type
# ------------------------------
BUMP_TYPE=$1

if [[ -z "$BUMP_TYPE" ]]; then
  echo
  echo "Select the version bump type:"
  echo "  patch (default): for bug fixes"
  echo "  minor: for backward-compatible features"
  echo "  major: for breaking changes"
  echo
  read -p "Enter bump type [patch|minor|major] (default: patch): " USER_INPUT
  BUMP_TYPE=${USER_INPUT:-patch}
fi

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  error "Invalid bump type '$BUMP_TYPE'. Must be one of: patch, minor, major."
  exit 1
fi

info "Bumping version ($BUMP_TYPE)..."
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)
NEW_VERSION=$(echo $NEW_VERSION | tr -d 'v')  # clean 'v' prefix

success "Version bumped: $CURRENT_VERSION → $NEW_VERSION"

# ------------------------------
# Step 3: Confirm publish
# ------------------------------
echo
read -p "Publish version $NEW_VERSION to npm? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  info "Publish cancelled."
  exit 0
fi

# ------------------------------
# Step 4: Build the package
# ------------------------------
info "Running build..."
npm run build

# ------------------------------
# Step 5: Publish to NPM
# ------------------------------
info "Publishing version $NEW_VERSION to npm..."
npm publish --access public

success "Package published successfully as version $NEW_VERSION!"
