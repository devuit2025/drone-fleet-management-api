#!/usr/bin/env bash
set -e

echo "🚀 Setting up ESLint + Prettier for TypeScript project..."

# ------------------------------------------------------------------------------
# Detect package manager
# ------------------------------------------------------------------------------
if [ -f "yarn.lock" ]; then
  PM="yarn add -D"
  RUN="yarn run"
else
  PM="npm install -D"
  RUN="npm run"
fi

# ------------------------------------------------------------------------------
# Install dependencies
# ------------------------------------------------------------------------------
echo "📦 Installing dev dependencies..."
$PM eslint prettier \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-config-prettier eslint-plugin-prettier \
  eslint-plugin-import eslint-import-resolver-typescript \
  eslint-plugin-sonarjs

# ------------------------------------------------------------------------------
# Create ESLint config
# ------------------------------------------------------------------------------
cat > .eslintrc.js <<'EOF'
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier',
    'sonarjs'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always'
      }
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/']
};
EOF

# ------------------------------------------------------------------------------
# Create Prettier config
# ------------------------------------------------------------------------------
cat > .prettierrc <<'EOF'
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOF

# ------------------------------------------------------------------------------
# Ignore files
# ------------------------------------------------------------------------------
cat > .eslintignore <<'EOF'
dist
node_modules
coverage
public
build
EOF

cat > .prettierignore <<'EOF'
dist
node_modules
coverage
public
build
*.min.js
EOF

# ------------------------------------------------------------------------------
# Add scripts to package.json
# ------------------------------------------------------------------------------
echo "🛠  Updating package.json scripts..."

node <<'EOF'
const fs = require('fs');
const pkgPath = 'package.json';
if (!fs.existsSync(pkgPath)) {
  console.error('❌ package.json not found. Run npm init -y first.');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};

pkg.scripts.lint = 'eslint "{src,apps,libs,test}/**/*.{ts,tsx,js}" --max-warnings=0';
pkg.scripts['lint:fix'] = 'eslint "{src,apps,libs,test}/**/*.{ts,tsx,js}" --fix';
pkg.scripts.format = 'prettier --write "{src,apps,libs,test}/**/*.{ts,tsx,js,json,md}"';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
EOF

# ------------------------------------------------------------------------------
# Optional: VSCode settings
# ------------------------------------------------------------------------------
mkdir -p .vscode
cat > .vscode/settings.json <<'EOF'
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "typescriptreact"]
}
EOF

echo "✅ ESLint + Prettier setup complete!"
echo ""
echo "👉 Run:"
echo "   $RUN lint         # Check lint issues"
echo "   $RUN lint:fix     # Auto-fix issues"
echo "   $RUN format       # Run Prettier formatting"
echo ""
echo "💡 Tip: Add Husky + lint-staged later for pre-commit checks."
