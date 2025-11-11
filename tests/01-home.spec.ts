import { test, expect } from '@playwright/test';

test.describe('Home Page - Dashboard', () => {
  test('should display the dashboard with key metrics', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check welcome message is displayed
    await expect(page.getByText(/Welcome back/)).toBeVisible();

    // Check that metric cards are displayed
    await expect(page.getByText('Total Companies')).toBeVisible();
    await expect(page.getByText('Total Checks')).toBeVisible();
    await expect(page.getByText('Compliant')).toBeVisible();
    await expect(page.getByText('Non-Compliant')).toBeVisible();

    // Check getting started section is visible
    await expect(page.getByText('Getting Started')).toBeVisible();
    await expect(page.getByText('Create a Company')).toBeVisible();
    await expect(page.getByText('Define Compliance Standards')).toBeVisible();
    await expect(page.getByText('Add Officers')).toBeVisible();

    // Check how it works section
    await expect(page.getByText('How It Works')).toBeVisible();
    await expect(page.getByText(/AI-powered uniform compliance verification/)).toBeVisible();
  });

  test('should navigate to different pages from sidebar', async ({ page }) => {
    await page.goto('/');

    // Navigate to Companies page
    await page.getByRole('link', { name: /companies/i }).click();
    await expect(page).toHaveURL('/companies');
    await expect(page.locator('h1')).toContainText('Companies');

    // Navigate to Officers page
    await page.getByRole('link', { name: /officers/i }).click();
    await expect(page).toHaveURL('/officers');
    await expect(page.locator('h1')).toContainText('Officers');

    // Navigate to Standards page
    await page.getByRole('link', { name: /standards/i }).click();
    await expect(page).toHaveURL('/standards');
    await expect(page.locator('h1')).toContainText('Standards');

    // Navigate to Checks page
    await page.getByRole('link', { name: /checks/i }).click();
    await expect(page).toHaveURL('/checks');
    await expect(page.locator('h1')).toContainText('Uniform Checks');

    // Navigate back to Home
    await page.getByRole('link', { name: /home|dashboard/i }).click();
    await expect(page).toHaveURL('/');
  });
});
