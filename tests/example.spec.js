import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  console.log('Navigated to https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
  console.log('Title contains "Playwright"');
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  console.log('Navigated to https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();
  console.log('Clicked "Get started" link');

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  console.log('Verified "Installation" heading is visible');
});
