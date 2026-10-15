const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const url = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

test('shows the Roblox playtest feedback form', async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle('Playtest feedback');
  await expect(page.getByRole('heading', { name: 'How was your playtest?' })).toBeVisible();
  await expect(page.getByText('Roblox Playtest')).toBeVisible();
  await expect(page.getByRole('button', { name: /Send playtest feedback/ })).toBeVisible();
});

test('requires an overall rating, game feeling, and replay answer', async ({ page }) => {
  await page.goto(url);
  await page.getByRole('button', { name: /Send playtest feedback/ }).click();
  await expect(page.getByRole('status')).toHaveText('');
  expect(await page.locator('#feedback-form').evaluate(form => form.checkValidity())).toBe(false);

  await page.locator('input[name="rating"][value="4"]').check();
  await page.getByLabel('Fun and engaging').check();
  await page.getByRole('button', { name: /Send playtest feedback/ }).click();
  await expect(page.getByRole('status')).toHaveText('');
  await page.getByLabel('Definitely').check();
  expect(await page.locator('#feedback-form').evaluate(form => form.checkValidity())).toBe(true);
});

test('saves a completed response in this browser and confirms submission', async ({ page }) => {
  await page.goto(url);
  await page.getByLabel('What should we call you?').fill('Tester');
  await page.locator('input[name="rating"][value="4"]').check();
  await page.getByLabel('Fun and engaging').check();
  await page.getByLabel('What was your favorite part?').fill('The exploration');
  await page.getByLabel('Definitely').check();
  await page.getByLabel('What did you play on?').selectOption('Computer');
  await page.getByRole('button', { name: /Send playtest feedback/ }).click();

  await expect(page.getByRole('status')).toHaveText(
    'Thanks for the feedback! It has been saved in this browser.'
  );
  const savedFeedback = await page.evaluate(() => JSON.parse(localStorage.getItem('playtest-feedback')));
  expect(savedFeedback).toHaveLength(1);
  expect(savedFeedback[0]).toMatchObject({
    playerName: 'Tester',
    rating: '4',
    feeling: 'Fun',
    favoritePart: 'The exploration',
    playAgain: 'Yes',
    device: 'Computer',
  });
  await expect(page.getByLabel('What should we call you?')).toHaveValue('');
});
