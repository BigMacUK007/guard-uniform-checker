import { test, expect } from '@playwright/test';

test.describe('Companies Management', () => {
  test('should display empty state when no companies exist', async ({ page }) => {
    await page.goto('/companies');

    // Check page title
    await expect(page.locator('h1')).toContainText('Companies');
    await expect(page.getByText('Manage your security guard companies')).toBeVisible();

    // Check for Add Company button
    await expect(page.getByRole('button', { name: /add company/i }).first()).toBeVisible();
  });

  test('should open create company dialog when clicking Add Company', async ({ page }) => {
    await page.goto('/companies');

    // Click Add Company button
    await page.getByRole('button', { name: /add company/i }).first().click();

    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add New Company')).toBeVisible();
    await expect(page.getByText('Create a new security guard company profile')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/company name/i)).toBeVisible();

    // Check buttons
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create company/i })).toBeVisible();
  });

  test('should create a new company successfully', async ({ page }) => {
    await page.goto('/companies');

    // Open dialog
    await page.getByRole('button', { name: /add company/i }).first().click();

    // Fill in company name
    const companyName = `Test Security Company ${Date.now()}`;
    await page.getByLabel(/company name/i).fill(companyName);

    // Submit form
    await page.getByRole('button', { name: /create company/i }).click();

    // Wait for success message
    await expect(page.getByText('Company created successfully')).toBeVisible({ timeout: 10000 });

    // Verify company appears in the list
    await expect(page.getByText(companyName)).toBeVisible();
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    await page.goto('/companies');

    // Open dialog
    await page.getByRole('button', { name: /add company/i }).first().click();

    // Submit without filling the form
    await page.getByRole('button', { name: /create company/i }).click();

    // Should show error message
    await expect(page.getByText(/company name is required/i)).toBeVisible();
  });

  test('should close dialog when clicking Cancel', async ({ page }) => {
    await page.goto('/companies');

    // Open dialog
    await page.getByRole('button', { name: /add company/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display company cards with details', async ({ page }) => {
    await page.goto('/companies');

    // First create a company
    await page.getByRole('button', { name: /add company/i }).first().click();
    const companyName = `Test Company ${Date.now()}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole('button', { name: /create company/i }).click();
    await expect(page.getByText('Company created successfully')).toBeVisible({ timeout: 10000 });

    // Verify company card shows the name
    await expect(page.getByText(companyName)).toBeVisible();

    // Verify created date is shown
    await expect(page.getByText(/created/i)).toBeVisible();

    // Verify View Details button exists
    await expect(page.getByRole('button', { name: /view details/i })).toBeVisible();
  });
});
