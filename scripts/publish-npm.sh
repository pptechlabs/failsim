#!/bin/bash

# FailSim NPM Publishing Script
# This script automates the NPM publishing process

set -e  # Exit on error

echo "🚀 FailSim NPM Publishing Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "packages/core/package.json" ]; then
    echo -e "${RED}Error: Must run from failsim root directory${NC}"
    exit 1
fi

cd packages/core

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Ask for version bump type
echo "Select version bump type:"
echo "1) Patch (bug fixes) - ${CURRENT_VERSION} -> $(npm version patch --no-git-tag-version --dry-run 2>&1 | grep -o 'v[0-9]*\.[0-9]*\.[0-9]*' | sed 's/v//')"
echo "2) Minor (new features) - ${CURRENT_VERSION} -> $(npm version minor --no-git-tag-version --dry-run 2>&1 | grep -o 'v[0-9]*\.[0-9]*\.[0-9]*' | sed 's/v//')"
echo "3) Major (breaking changes) - ${CURRENT_VERSION} -> $(npm version major --no-git-tag-version --dry-run 2>&1 | grep -o 'v[0-9]*\.[0-9]*\.[0-9]*' | sed 's/v//')"
echo "4) Skip version bump"
echo ""
read -p "Enter choice (1-4): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        npm version patch --no-git-tag-version
        ;;
    2)
        npm version minor --no-git-tag-version
        ;;
    3)
        npm version major --no-git-tag-version
        ;;
    4)
        echo "Skipping version bump"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Version: ${NEW_VERSION}${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

# Build
echo "🔨 Building package..."
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Check what will be published
echo "📦 Files to be published:"
npm pack --dry-run
echo ""

# Confirm publication
read -p "Publish to NPM? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Publication cancelled"
    exit 0
fi

# Check if logged in
if ! npm whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to NPM${NC}"
    echo "Please login:"
    npm login
fi

# Publish
echo ""
echo "📤 Publishing to NPM..."
npm publish

echo ""
echo -e "${GREEN}✓ Successfully published failsim@${NEW_VERSION}${NC}"
echo ""
echo "Next steps:"
echo "1. Create git tag: git tag v${NEW_VERSION}"
echo "2. Push tag: git push origin v${NEW_VERSION}"
echo "3. Create GitHub release"
echo "4. Update CHANGELOG.md"
echo ""
echo "View on NPM: https://www.npmjs.com/package/failsim"


