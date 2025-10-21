# Testing Documentation

## Overview

This project includes comprehensive end-to-end (E2E) tests using Playwright to verify user workflows in the Guard Uniform Compliance Checker application.

## Test Suite

### Test Files Created

1. **01-home.spec.ts** - Dashboard and Navigation Tests
   - Verifies dashboard displays correctly
   - Tests navigation between pages
   - Validates metric cards and getting started guide

2. **02-companies.spec.ts** - Company Management Tests
   - Company creation workflow
   - Form validation
   - Empty state handling
   - Company list display

3. **03-officers.spec.ts** - Officer Management Tests
   - Officer creation with all fields
   - Company filter functionality
   - Table display and data persistence
   - Form validation and prerequisites

4. **04-standards.spec.ts** - Compliance Standards Tests
   - Standards creation with multiple requirements
   - Dynamic requirement addition/removal
   - Form validation
   - Standards display with badges

5. **05-checks.spec.ts** - Uniform Checks Tests
   - Check submission dialog
   - Form field dependencies
   - Photo upload interface
   - Status badge display

6. **06-complete-workflow.spec.ts** - End-to-End Integration Tests
   - Complete user journey: Company → Standard → Officer → Check
   - Data persistence verification
   - Workflow dependency enforcement
   - Integration between all modules

## Quick Start

```bash
# Install dependencies (if not already done)
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium

# Run all tests
pnpm test:e2e

# Run tests with UI (recommended)
pnpm test:e2e:ui

# Run tests in headed mode
pnpm test:e2e:headed

# View test report
pnpm test:e2e:report
```

## Test Scripts

Available npm scripts:

- `pnpm test:e2e` - Run all E2E tests in headless mode
- `pnpm test:e2e:ui` - Open Playwright UI for interactive testing
- `pnpm test:e2e:headed` - Run tests with visible browser
- `pnpm test:e2e:report` - View HTML test report

## Documentation

- **tests/README.md** - Detailed test documentation, best practices, and debugging guide
- **tests/SETUP.md** - Complete setup instructions including environment variables, database, and troubleshooting

## Test Coverage

### User Workflows Tested

✅ **Dashboard Navigation**
- View dashboard metrics
- Navigate between pages
- Access all main features

✅ **Company Management**
- Create new companies
- View company list
- Form validation

✅ **Officer Management**
- Add security officers
- Link officers to companies
- Validate required fields
- Display in table format

✅ **Compliance Standards**
- Define uniform requirements
- Add/remove requirement items
- Create standards per company
- Display with requirement badges

✅ **Uniform Checks**
- Submit check form
- Field dependencies (company → officer/standard)
- Photo upload interface
- Location tracking

✅ **End-to-End Integration**
- Complete workflow from setup to check submission
- Data persistence across pages
- Dependency enforcement
- Cross-module integration

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './tests',
  workers: 1, // Sequential execution
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  }
}
```

### Environment Setup

Required environment variables in `.env`:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - JWT signing secret
- `OAUTH_SERVER_URL` - Manus OAuth server
- `VITE_APP_ID` - Application ID
- `PORT` - Server port (default: 3000)

## CI/CD Integration

Tests are configured for CI/CD with:
- Automatic retry on failure (2 retries in CI)
- Screenshot capture on failure
- Trace recording for debugging
- HTML report generation

See `tests/SETUP.md` for GitHub Actions example.

## Known Limitations

1. **Image Upload**: Tests verify the interface but don't submit actual checks requiring:
   - S3 credentials
   - AI analysis API configuration
   - Valid image files

2. **Authentication**: Assumes Manus OAuth is configured or bypassed

3. **Database**: Expects clean test database instance

## Future Enhancements

- Visual regression testing
- Performance testing
- Mobile viewport testing
- Cross-browser testing (Firefox, Safari)
- API endpoint testing
- Accessibility (a11y) testing

## Getting Help

1. Check `tests/README.md` for detailed documentation
2. Review `tests/SETUP.md` for setup troubleshooting
3. Use `pnpm test:e2e:ui` for interactive debugging
4. Check test output and Playwright traces
5. Open GitHub issue for bugs

## Test Statistics

- **Total Test Files**: 6
- **Total Test Cases**: ~40+
- **Coverage Areas**: 5 (Home, Companies, Officers, Standards, Checks)
- **Integration Tests**: 3 complete workflows
- **Estimated Run Time**: 2-5 minutes (depending on environment)

## Contributing

When adding new features:

1. Add corresponding test file or cases
2. Follow existing test patterns
3. Use unique timestamps for test data
4. Include assertions for success/failure states
5. Document any new setup requirements

## Support

For issues or questions:
- Review Playwright docs: https://playwright.dev
- Check test output and traces
- Use `--debug` mode for step-through debugging
- Report issues on GitHub
