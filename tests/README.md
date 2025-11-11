# Playwright E2E Tests for Guard Uniform Checker

This directory contains end-to-end tests for the Guard Uniform Compliance Checker application using Playwright.

## Test Structure

The tests are organized by feature/page:

- `01-home.spec.ts` - Dashboard and navigation tests
- `02-companies.spec.ts` - Company management tests
- `03-officers.spec.ts` - Officer management tests
- `04-standards.spec.ts` - Compliance standards tests
- `05-checks.spec.ts` - Uniform checks submission tests
- `06-complete-workflow.spec.ts` - End-to-end workflow tests

## Running Tests

### Prerequisites

1. Ensure the database is set up and configured
2. Set up required environment variables in `.env`
3. Install Playwright browsers (if not already done):
   ```bash
   pnpm exec playwright install chromium
   ```

### Test Commands

```bash
# Run all tests (headless)
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see the browser)
pnpm test:e2e:headed

# View test report
pnpm test:e2e:report

# Run specific test file
pnpm exec playwright test tests/02-companies.spec.ts

# Run tests matching a pattern
pnpm exec playwright test --grep "create company"

# Debug mode
pnpm exec playwright test --debug
```

## Test Coverage

### Home Page (01-home.spec.ts)
- Dashboard displays correctly with metrics
- Navigation between pages works
- Welcome message and getting started guide visible

### Companies (02-companies.spec.ts)
- Display empty state
- Create new company
- Validate form fields
- Display company cards
- Dialog open/close functionality

### Officers (03-officers.spec.ts)
- Display officers page
- Company filter dropdown
- Create new officer with all fields
- Form validation
- Display officers in table
- Company prerequisite enforced

### Standards (04-standards.spec.ts)
- Display standards page
- Create compliance standards
- Add/remove requirements dynamically
- Form validation
- Display standards with requirement badges
- Enter key support for adding requirements

### Checks (05-checks.spec.ts)
- Display checks page
- Submit check dialog
- Form field dependencies (officer/standard enabled after company selection)
- Photo upload interface
- Form validation
- Status badge display

### Complete Workflow (06-complete-workflow.spec.ts)
- Full user journey: Company → Standard → Officer → Check submission
- Data persistence across navigation
- Workflow dependency enforcement
- Integration between all modules

## Test Best Practices

1. **Test Isolation**: Each test is independent and creates its own test data
2. **Timestamps**: Test data uses timestamps to ensure uniqueness
3. **Waits**: Tests use Playwright's auto-waiting and explicit assertions
4. **Cleanup**: Tests create new data rather than cleaning up (test database should be reset periodically)
5. **Prerequisites**: Some tests have beforeEach hooks to set up required data

## Configuration

Test configuration is in `playwright.config.ts`:

- Base URL: `http://localhost:3000`
- Test timeout: 30 seconds (default)
- Browser: Chromium
- Workers: 1 (sequential execution)
- Traces: Captured on first retry
- Screenshots: On failure only

## Debugging Tests

### Using Playwright Inspector
```bash
pnpm exec playwright test --debug
```

### Using UI Mode
```bash
pnpm test:e2e:ui
```

### Viewing Traces
When a test fails, traces are automatically captured. View them:
```bash
pnpm exec playwright show-trace trace.zip
```

### Console Logs
Tests include console.log statements for workflow verification. These appear in test output with `✓` prefixes.

## CI/CD Integration

The tests are configured to work in CI environments:
- Auto-retry on failure (2 retries in CI)
- Parallel execution disabled for data consistency
- Web server automatically starts before tests
- Screenshots and traces captured on failure

## Test Data

Tests create data with unique timestamps to avoid conflicts:
- Companies: `Test Company ${timestamp}`
- Officers: `Test Officer ${timestamp}`
- Standards: `Standard ${timestamp}`
- Emails: `officer${timestamp}@test.com`

## Known Limitations

1. **Image Upload**: Tests verify the upload interface but don't submit actual checks as this requires:
   - Valid S3 credentials
   - Image files
   - AI analysis API configuration

2. **Authentication**: Tests assume Manus authentication is configured or bypassed for testing

3. **Database**: Tests expect a clean or test database instance

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Mobile viewport testing
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] API testing integration
- [ ] Test data cleanup utilities
- [ ] Screenshot comparison
- [ ] Accessibility testing

## Troubleshooting

### Tests fail to start
- Ensure database is running and accessible
- Check environment variables are set
- Verify port 3000 is available

### Timing issues
- Increase timeout in specific tests
- Use more specific selectors
- Add explicit wait conditions

### Element not found
- Check selector specificity
- Verify page is fully loaded
- Use Playwright Inspector to debug selectors

## Support

For issues or questions about the tests:
1. Check Playwright documentation: https://playwright.dev
2. Review test output and traces
3. Use `--debug` mode to step through tests
4. Check GitHub issues
