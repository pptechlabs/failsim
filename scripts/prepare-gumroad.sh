#!/bin/bash

# FailSim Gumroad Package Preparation Script
# Creates a premium package for Gumroad

set -e

echo "💰 FailSim Gumroad Package Creator"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "packages/core/package.json" ]; then
    echo "Error: Must run from failsim root directory"
    exit 1
fi

# Get version
VERSION=$(node -p "require('./packages/core/package.json').version")
PACKAGE_NAME="failsim-premium-v${VERSION}"
OUTPUT_DIR="dist-gumroad/${PACKAGE_NAME}"

echo -e "${YELLOW}Creating premium package: ${PACKAGE_NAME}${NC}"
echo ""

# Clean and create output directory
rm -rf dist-gumroad
mkdir -p "${OUTPUT_DIR}"

# Copy source code
echo "📦 Copying source code..."
cp -r packages "${OUTPUT_DIR}/"
cp -r examples "${OUTPUT_DIR}/"

# Copy documentation
echo "📄 Copying documentation..."
cp README.md "${OUTPUT_DIR}/"
cp PUBLISHING.md "${OUTPUT_DIR}/"

# Create premium README
cat > "${OUTPUT_DIR}/README-PREMIUM.md" << 'EOF'
# FailSim Premium

Thank you for purchasing FailSim Premium! 🎉

## What's Included

✅ **Complete Source Code**
- Core library with all features
- Dashboard with React UI
- All adapters (fetch, axios, Express)

✅ **Examples**
- React application example
- Express server example
- Next.js integration (coming soon)

✅ **Documentation**
- Complete API reference
- Publishing guide
- Best practices

✅ **Commercial License**
- Use in unlimited projects
- Modify source code freely
- No attribution required

✅ **Premium Support**
- Email support: support@yoursite.com
- Response within 24 hours
- Bug fixes and updates

## Quick Start

1. **Install Dependencies**
   ```bash
   cd packages/core
   npm install
   npm run build
   ```

2. **Try Examples**
   ```bash
   cd examples/react-app
   npm install
   npm run dev
   ```

3. **Use in Your Project**
   ```bash
   npm install /path/to/packages/core
   ```

## Support

- Email: support@yoursite.com
- Documentation: See README.md
- Updates: Check your Gumroad library

## License

Commercial License - See LICENSE-COMMERCIAL.txt

You may:
- Use in unlimited commercial projects
- Modify the source code
- Create derivative works

You may not:
- Redistribute or resell the source code
- Remove copyright notices
- Use in competing products

---

Enjoy building resilient applications! 🚀
EOF

# Create commercial license
cat > "${OUTPUT_DIR}/LICENSE-COMMERCIAL.txt" << 'EOF'
FAILSIM PREMIUM COMMERCIAL LICENSE

Copyright (c) 2024 [Your Name]

This is a legal agreement between you (the "Licensee") and the copyright holder
(the "Licensor") for the use of FailSim Premium (the "Software").

GRANT OF LICENSE

The Licensor grants the Licensee a non-exclusive, non-transferable license to:

1. Use the Software in unlimited commercial and non-commercial projects
2. Modify the Software source code for your own use
3. Create derivative works based on the Software
4. Use the Software in client projects

RESTRICTIONS

The Licensee may not:

1. Redistribute, resell, or sublicense the Software source code
2. Remove or modify any copyright notices
3. Use the Software to create competing products
4. Share access credentials with others

SUPPORT AND UPDATES

- Email support included for 1 year from purchase date
- Free updates for 1 year from purchase date
- Extended support available for additional fee

WARRANTY DISCLAIMER

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

LIMITATION OF LIABILITY

IN NO EVENT SHALL THE LICENSOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY ARISING FROM THE USE OF THE SOFTWARE.

This license is effective until terminated. The Licensor may terminate this
license if the Licensee breaches any terms.

For questions, contact: support@yoursite.com
EOF

# Create quick start guide
cat > "${OUTPUT_DIR}/QUICKSTART.md" << 'EOF'
# FailSim Premium - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Core Package

```bash
cd packages/core
npm install
npm run build
```

## Step 2: Test Installation

```bash
npm test
```

All tests should pass ✓

## Step 3: Try an Example

### React Example
```bash
cd examples/react-app
npm install
npm run dev
```

Open http://localhost:5173

### Express Example
```bash
cd examples/express-app
npm install
npm start
```

Test with: `curl http://localhost:3000/api/users`

## Step 4: Use in Your Project

### Option A: Link Locally
```bash
cd packages/core
npm link

cd /your/project
npm link failsim
```

### Option B: Install from File
```bash
cd /your/project
npm install /path/to/failsim/packages/core
```

### Option C: Publish to Private NPM
```bash
# Set up private registry
npm config set registry https://your-registry.com

cd packages/core
npm publish
```

## Step 5: Basic Usage

```typescript
import { failsim } from 'failsim';

// Initialize with rules
failsim.init({
  rules: [
    {
      match: '/api/**',
      failure: '500',
      chance: 30
    }
  ]
});

// Make requests - 30% will fail with 500 error
fetch('/api/users')
  .then(res => res.json())
  .catch(err => console.error('Failed:', err));
```

## Step 6: Try Presets

```typescript
import { preset } from 'failsim';

// Simulate slow 3G connection
preset('slow-3g');

// Simulate flaky network
preset('flaky');

// Simulate server downtime
preset('server-down');
```

## Step 7: Use Dashboard

```bash
cd packages/dashboard
npm install
npm run dev
```

Open http://localhost:5174

## Need Help?

- 📧 Email: support@yoursite.com
- 📖 Docs: See README.md
- 💬 Response time: Within 24 hours

## Next Steps

1. Read the full README.md
2. Explore examples/
3. Check PUBLISHING.md to publish your own version
4. Join our community (link in README)

Happy coding! 🚀
EOF

# Clean up node_modules and build artifacts
echo "🧹 Cleaning up..."
find "${OUTPUT_DIR}" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find "${OUTPUT_DIR}" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find "${OUTPUT_DIR}" -name ".DS_Store" -delete 2>/dev/null || true

# Create zip file
echo "📦 Creating zip file..."
cd dist-gumroad
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}" -x "*/node_modules/*" "*/.git/*" "*/dist/*"

# Calculate size
SIZE=$(du -sh "${PACKAGE_NAME}.zip" | cut -f1)

echo ""
echo -e "${GREEN}✓ Package created successfully!${NC}"
echo ""
echo "Package: dist-gumroad/${PACKAGE_NAME}.zip"
echo "Size: ${SIZE}"
echo ""
echo "Next steps:"
echo "1. Test the package by extracting and running examples"
echo "2. Upload to Gumroad"
echo "3. Set price and description"
echo "4. Add cover image and screenshots"
echo "5. Publish!"
echo ""
echo "Gumroad upload: https://gumroad.com/products/new"


