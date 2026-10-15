const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const url = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

test('page loads', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('h1')).toHaveText('Playtest Feedback Tracker');
});

test('rejects an empty title', async ({ page }) => {
  await page.goto(url);
  await page.click('button[type=submit]');
  await expect(page.locator('#error')).toHaveText('Title is required');
});

test('adds an entry', async ({ page }) => {
  await page.goto(url);
  await page.fill('#title', 'Stuck at map wall');
  await page.selectOption('#severity', 'High');
  await page.click('button[type=submit]');
  await expect(page.locator('#list li')).toHaveText('Stuck at map wall (High)');
});

test('filters by severity', async ({ page }) => {
  await page.goto(url);
  await page.fill('#title', 'Minor typo');
  await page.selectOption('#severity', 'Low');
  await page.click('button[type=submit]');
  await page.fill('#title', 'Crash on round end');
  await page.selectOption('#severity', 'High');
  await page.click('button[type=submit]');
  await page.selectOption('#filter', 'High');
  await expect(page.locator('#list li')).toHaveCount(1);
});