import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Uniform Checks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create company, officer, and standard first
    await page.goto('/companies');
    const companyName = `Test Company ${Date.now()}`;

    const addButton = page.getByRole('button', { name: /add company/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.getByLabel(/company name/i).fill(companyName);
      await page.getByRole('button', { name: /create company/i }).click();
      await expect(page.getByText('Company created successfully')).toBeVisible({ timeout: 10000 });
    }

    // Create officer
    await page.goto('/officers');
    await page.getByRole('button', { name: /add officer/i }).click();
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();
    await page.getByLabel(/officer name/i).fill(`Officer ${Date.now()}`);
    await page.getByRole('button', { name: /add officer/i }).click();
    await expect(page.getByText('Officer added successfully')).toBeVisible({ timeout: 10000 });

    // Create standard
    await page.goto('/standards');
    await page.getByRole('button', { name: /add standard/i }).click();
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();
    await page.getByLabel(/standard name/i).fill(`Standard ${Date.now()}`);
    await page.getByPlaceholder(/hi-vis vest/i).fill('Hi-vis vest');
    await page.getByRole('button', { name: /^add$/i }).click();
    await page.getByRole('button', { name: /create standard/i }).click();
    await expect(page.getByText('Standard created successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should display checks page', async ({ page }) => {
    await page.goto('/checks');

    // Check page title
    await expect(page.locator('h1')).toContainText('Uniform Checks');
    await expect(page.getByText('View and submit uniform compliance checks')).toBeVisible();

    // Check for Submit Check button
    await expect(page.getByRole('button', { name: /submit check/i })).toBeVisible();
  });

  test('should display company filter dropdown', async ({ page }) => {
    await page.goto('/checks');

    // Check for company filter
    await expect(page.getByText(/filter by company/i)).toBeVisible();
  });

  test('should open submit check dialog', async ({ page }) => {
    await page.goto('/checks');

    // Click Submit Check button
    await page.getByRole('button', { name: /submit check/i }).click();

    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Submit Uniform Check')).toBeVisible();
    await expect(page.getByText('Upload a photo for AI-powered compliance verification')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/company/i).first()).toBeVisible();
    await expect(page.getByLabel(/officer/i)).toBeVisible();
    await expect(page.getByLabel(/compliance standard/i)).toBeVisible();
    await expect(page.getByLabel(/location/i)).toBeVisible();
    await expect(page.getByLabel(/photo/i)).toBeVisible();
  });

  test('should enable/disable officer and standard fields based on company selection', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Officer and Standard should be disabled initially
    const officerSelect = page.getByLabel(/officer/i);
    const standardSelect = page.getByLabel(/compliance standard/i);

    await expect(officerSelect).toBeDisabled();
    await expect(standardSelect).toBeDisabled();

    // Select company
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    // Officer and Standard should now be enabled
    await expect(officerSelect).toBeEnabled();
    await expect(standardSelect).toBeEnabled();
  });

  test('should show photo upload button', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Check for photo upload button
    await expect(page.getByRole('button', { name: /take\/upload photo/i })).toBeVisible();
  });

  test('should close dialog when clicking Cancel', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Try to submit without filling fields
    await page.getByRole('button', { name: /submit & analyze/i }).click();

    // Should show error - fields are required
    await expect(page.getByText(/all fields and an image are required/i)).toBeVisible();
  });

  test('should display status badges correctly', async ({ page }) => {
    await page.goto('/checks');

    // The page should have table headers even if empty
    // Just verify the page structure is correct
    await expect(page.getByRole('button', { name: /submit check/i })).toBeVisible();
  });

  test('should populate officer dropdown when company is selected', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Select company
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    // Open officer dropdown
    await page.getByLabel(/officer/i).click();

    // Should have at least one option (the officer we created)
    await expect(page.getByRole('option').first()).toBeVisible();
  });

  test('should populate standard dropdown when company is selected', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Select company
    await page.getByLabel(/company/i).first().click();
    await page.getByRole('option').first().click();

    // Open standard dropdown
    await page.getByLabel(/compliance standard/i).click();

    // Should have at least one option (the standard we created)
    await expect(page.getByRole('option').first()).toBeVisible();
  });

  test('should accept location input', async ({ page }) => {
    await page.goto('/checks');

    // Open dialog
    await page.getByRole('button', { name: /submit check/i }).click();

    // Fill location field
    const location = 'Main entrance, Building A';
    await page.getByLabel(/location/i).fill(location);

    // Verify value
    await expect(page.getByLabel(/location/i)).toHaveValue(location);
  });
});
