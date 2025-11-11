import { test, expect } from '@playwright/test';

test.describe('Officers Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create a company first to be used in officer tests
    await page.goto('/companies');
    const companyName = `Test Company for Officers ${Date.now()}`;

    // Check if Add Company button exists
    const addButton = page.getByRole('button', { name: /add company/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.getByLabel(/company name/i).fill(companyName);
      await page.getByRole('button', { name: /create company/i }).click();
      await expect(page.getByText('Company created successfully')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display officers page', async ({ page }) => {
    await page.goto('/officers');

    // Check page title
    await expect(page.locator('h1')).toContainText('Officers');
    await expect(page.getByText('Manage your security officers')).toBeVisible();

    // Check for Add Officer button
    await expect(page.getByRole('button', { name: /add officer/i })).toBeVisible();
  });

  test('should display company filter dropdown', async ({ page }) => {
    await page.goto('/officers');

    // Check for company filter
    await expect(page.getByText(/filter by company/i)).toBeVisible();
  });

  test('should open create officer dialog', async ({ page }) => {
    await page.goto('/officers');

    // Click Add Officer button
    await page.getByRole('button', { name: /add officer/i }).click();

    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add New Officer')).toBeVisible();
    await expect(page.getByText('Register a new security officer in the system')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/company/i).first()).toBeVisible();
    await expect(page.getByLabel(/officer name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/badge number/i)).toBeVisible();
  });

  test('should create a new officer successfully', async ({ page }) => {
    await page.goto('/officers');

    // Open dialog
    await page.getByRole('button', { name: /add officer/i }).click();

    // Select company (first available)
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    // Fill in officer details
    const officerName = `Test Officer ${Date.now()}`;
    await page.getByLabel(/officer name/i).fill(officerName);
    await page.getByLabel(/email/i).fill(`officer${Date.now()}@test.com`);
    await page.getByLabel(/badge number/i).fill(`BADGE${Date.now()}`);

    // Submit form
    await page.getByRole('button', { name: /add officer/i }).click();

    // Wait for success message
    await expect(page.getByText('Officer added successfully')).toBeVisible({ timeout: 10000 });

    // Verify officer appears in the table
    await expect(page.getByText(officerName)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/officers');

    // Open dialog
    await page.getByRole('button', { name: /add officer/i }).click();

    // Submit without filling required fields
    await page.getByRole('button', { name: /add officer/i }).click();

    // Should show validation error
    await expect(page.getByText(/company and officer name are required/i)).toBeVisible();
  });

  test('should display officers in a table', async ({ page }) => {
    await page.goto('/officers');

    // Create an officer first
    await page.getByRole('button', { name: /add officer/i }).click();
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    const officerName = `Test Officer ${Date.now()}`;
    const email = `officer${Date.now()}@test.com`;
    const badgeNumber = `BADGE${Date.now()}`;

    await page.getByLabel(/officer name/i).fill(officerName);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/badge number/i).fill(badgeNumber);
    await page.getByRole('button', { name: /add officer/i }).click();

    await expect(page.getByText('Officer added successfully')).toBeVisible({ timeout: 10000 });

    // Verify table headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /badge number/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /created/i })).toBeVisible();

    // Verify officer data appears in table
    await expect(page.getByText(officerName)).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(badgeNumber)).toBeVisible();
  });
});
