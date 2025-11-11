import { test, expect } from '@playwright/test';

test.describe('Compliance Standards Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create a company first
    await page.goto('/companies');
    const companyName = `Test Company for Standards ${Date.now()}`;

    const addButton = page.getByRole('button', { name: /add company/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.getByLabel(/company name/i).fill(companyName);
      await page.getByRole('button', { name: /create company/i }).click();
      await expect(page.getByText('Company created successfully')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display standards page', async ({ page }) => {
    await page.goto('/standards');

    // Check page title
    await expect(page.locator('h1')).toContainText('Compliance Standards');
    await expect(page.getByText('Define uniform requirements for your security officers')).toBeVisible();

    // Check for Add Standard button
    await expect(page.getByRole('button', { name: /add standard/i })).toBeVisible();
  });

  test('should display company filter dropdown', async ({ page }) => {
    await page.goto('/standards');

    // Check for company filter
    await expect(page.getByText(/filter by company/i)).toBeVisible();
  });

  test('should open create standard dialog', async ({ page }) => {
    await page.goto('/standards');

    // Click Add Standard button
    await page.getByRole('button', { name: /add standard/i }).click();

    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create Compliance Standard')).toBeVisible();
    await expect(page.getByText('Define the uniform requirements for your security officers')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/company/i).first()).toBeVisible();
    await expect(page.getByLabel(/standard name/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/required items/i)).toBeVisible();
  });

  test('should add and remove requirements', async ({ page }) => {
    await page.goto('/standards');

    // Open dialog
    await page.getByRole('button', { name: /add standard/i }).click();

    // Add first requirement
    await page.getByPlaceholder(/hi-vis vest/i).fill('Hi-vis vest');
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByText('Hi-vis vest')).toBeVisible();

    // Add second requirement
    await page.getByPlaceholder(/hi-vis vest/i).fill('Body-worn camera');
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByText('Body-worn camera')).toBeVisible();

    // Add third requirement
    await page.getByPlaceholder(/hi-vis vest/i).fill('SIA badge');
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByText('SIA badge')).toBeVisible();

    // Remove second requirement
    const bodyWornBadge = page.locator('text=Body-worn camera').locator('..');
    await bodyWornBadge.locator('button').click();
    await expect(page.getByText('Body-worn camera')).not.toBeVisible();

    // Verify other requirements still exist
    await expect(page.getByText('Hi-vis vest')).toBeVisible();
    await expect(page.getByText('SIA badge')).toBeVisible();
  });

  test('should create a compliance standard successfully', async ({ page }) => {
    await page.goto('/standards');

    // Open dialog
    await page.getByRole('button', { name: /add standard/i }).click();

    // Select company
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    // Fill in standard details
    const standardName = `Standard Uniform ${Date.now()}`;
    await page.getByLabel(/standard name/i).fill(standardName);
    await page.getByLabel(/description/i).fill('Standard uniform requirements for all officers');

    // Add requirements
    const requirements = ['Hi-vis vest', 'Body-worn camera', 'SIA badge'];
    for (const req of requirements) {
      await page.getByPlaceholder(/hi-vis vest/i).fill(req);
      await page.getByRole('button', { name: /^add$/i }).click();
    }

    // Submit form
    await page.getByRole('button', { name: /create standard/i }).click();

    // Wait for success message
    await expect(page.getByText('Standard created successfully')).toBeVisible({ timeout: 10000 });

    // Verify standard appears in the list
    await expect(page.getByText(standardName)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/standards');

    // Open dialog
    await page.getByRole('button', { name: /add standard/i }).click();

    // Submit without filling required fields
    await page.getByRole('button', { name: /create standard/i }).click();

    // Should show validation error
    await expect(page.getByText(/company, name, and at least one requirement are required/i)).toBeVisible();
  });

  test('should display standard cards with details', async ({ page }) => {
    await page.goto('/standards');

    // Create a standard
    await page.getByRole('button', { name: /add standard/i }).click();
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    const standardName = `Test Standard ${Date.now()}`;
    await page.getByLabel(/standard name/i).fill(standardName);
    await page.getByLabel(/description/i).fill('Test description');

    // Add requirements
    const requirements = ['Hi-vis vest', 'Body-worn camera'];
    for (const req of requirements) {
      await page.getByPlaceholder(/hi-vis vest/i).fill(req);
      await page.getByRole('button', { name: /^add$/i }).click();
    }

    await page.getByRole('button', { name: /create standard/i }).click();
    await expect(page.getByText('Standard created successfully')).toBeVisible({ timeout: 10000 });

    // Verify standard card shows details
    await expect(page.getByText(standardName)).toBeVisible();
    await expect(page.getByText('Test description')).toBeVisible();

    // Verify requirements are shown as badges
    await expect(page.getByText('Hi-vis vest')).toBeVisible();
    await expect(page.getByText('Body-worn camera')).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /view details/i }).first()).toBeVisible();
  });

  test('should add requirement by pressing Enter', async ({ page }) => {
    await page.goto('/standards');

    // Open dialog
    await page.getByRole('button', { name: /add standard/i }).click();

    // Type requirement and press Enter
    await page.getByPlaceholder(/hi-vis vest/i).fill('Test requirement');
    await page.getByPlaceholder(/hi-vis vest/i).press('Enter');

    // Verify requirement was added
    await expect(page.getByText('Test requirement')).toBeVisible();
  });
});
