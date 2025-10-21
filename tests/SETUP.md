# Test Setup Guide

## Prerequisites

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/guard_uniform_checker_test

# JWT Secret
JWT_SECRET=test-jwt-secret-for-development

# OAuth Configuration (for Manus authentication)
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev

# OpenAI API (for uniform analysis - optional for basic tests)
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_KEY=your-openai-api-key

# Server Port
PORT=3000

# App Configuration
VITE_APP_TITLE="Guard Uniform Checker"
VITE_APP_LOGO="https://placehold.co/40x40/3b82f6/ffffff?text=G"
```

### 2. Database Setup

1. Install and start MySQL or use TiDB
2. Create a test database:
   ```bash
   mysql -u root -p
   CREATE DATABASE guard_uniform_checker_test;
   ```

3. Run database migrations:
   ```bash
   pnpm db:push
   ```

### 3. Install Playwright Browsers

```bash
pnpm exec playwright install chromium
```

**Note**: If browser installation fails due to network restrictions, you can:
- Use a VPN or proxy
- Download browsers manually
- Use system browsers with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`

### 4. Verify Setup

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Verify the app loads at http://localhost:3000

3. Stop the dev server (Ctrl+C) - Playwright will start it automatically during tests

## Running Tests

Once setup is complete:

```bash
# Run all tests
pnpm test:e2e

# Run with UI (recommended for first time)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed
```

## Troubleshooting

### Browser Installation Issues

If `playwright install` fails:

1. Try with specific browser:
   ```bash
   pnpm exec playwright install chromium --with-deps
   ```

2. Use system browser:
   ```bash
   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm add -D @playwright/test
   ```

3. Set up a proxy if behind firewall:
   ```bash
   export HTTPS_PROXY=http://your-proxy:port
   pnpm exec playwright install
   ```

### Database Connection Issues

1. Verify MySQL is running:
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```

2. Check DATABASE_URL format:
   ```
   mysql://username:password@host:port/database
   ```

3. Ensure user has proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON guard_uniform_checker_test.* TO 'user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Port Already in Use

If port 3000 is busy:

1. Find and kill the process:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or change the port in `.env`:
   ```
   PORT=3001
   ```
   And update `playwright.config.ts` baseURL accordingly.

### Authentication Issues

The app uses Manus OAuth. For testing, you may need to:

1. Set up a Manus app and get credentials
2. Or modify the app to bypass auth in test mode
3. Or use mock authentication for tests

## Test Database Cleanup

Periodically clean test data:

```sql
USE guard_uniform_checker_test;
TRUNCATE TABLE checks;
TRUNCATE TABLE officers;
TRUNCATE TABLE standards;
TRUNCATE TABLE companies;
```

Or reset the entire database:

```bash
mysql -u root -p guard_uniform_checker_test < /dev/null
pnpm db:push
```

## CI/CD Setup

For running tests in CI:

1. Use GitHub Actions or similar
2. Set up database service (MySQL container)
3. Set environment variables as secrets
4. Install Playwright browsers in CI:
   ```yaml
   - name: Install Playwright Browsers
     run: pnpm exec playwright install --with-deps chromium
   ```

Example GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: guard_uniform_checker_test
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm db:push
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Next Steps

After successful setup:

1. Review test files in `tests/` directory
2. Read `tests/README.md` for detailed test documentation
3. Run tests and review results
4. Add more tests as needed
5. Integrate into CI/CD pipeline
