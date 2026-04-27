import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicRoutes = ['/', '/work', '/contact', '/blog', '/imprint', '/privacy'];

const primaryPages = [
  { path: '/', heading: /inside the work/i },
  { path: '/work', heading: /martin trenker/i },
  { path: '/contact', heading: /contact/i },
];

const primaryTapTargets = [
  /start a diagnostic/i,
  /inspect the proof/i,
  /portfolio/i,
  /contact/i,
];

test.describe('public site accessibility', () => {
  for (const route of publicRoutes) {
    test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .disableRules([
          // We intentionally keep social/profile links in multiple page regions.
          // Distinct accessible names are still tested by role where it matters.
          'landmark-unique',
        ])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('public site mobile friendliness', () => {
  for (const route of publicRoutes) {
    test(`${route} does not create horizontal scrolling`, async ({ page }) => {
      await page.goto(route);

      const overflow = await page.evaluate(() => {
        const documentElement = document.documentElement;
        return documentElement.scrollWidth - documentElement.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('homepage presents core navigation and CTAs on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-specific UX check');

    await page.goto('/');

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /main/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /inside the work/i })).toBeVisible();

    for (const name of primaryTapTargets) {
      await expect(page.getByRole('link', { name }).first()).toBeVisible();
    }
  });

  test('primary homepage actions are comfortable tap targets', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-specific UX check');

    await page.goto('/');

    for (const name of [/start a diagnostic/i, /inspect the proof/i]) {
      const target = page.getByRole('link', { name }).first();
      const box = await target.boundingBox();
      expect(box, `${name} should be visible and measurable`).not.toBeNull();
      expect(box!.height, `${name} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
      expect(box!.width, `${name} should be at least 44px wide`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('public site semantic UX', () => {
  for (const pageInfo of primaryPages) {
    test(`${pageInfo.path} has stable page semantics`, async ({ page }) => {
      await page.goto(pageInfo.path);

      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: pageInfo.heading })).toBeVisible();
      await expect(page.getByRole('navigation', { name: /main/i })).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  }

  test('skip link moves keyboard users to the main content', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('contact page exposes a usable, labelled form without knowing component internals', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();

    await page.getByRole('textbox', { name: /name/i }).fill('A11y Tester');
    await page.getByRole('textbox', { name: /email/i }).fill('tester@example.com');
    await page.getByRole('textbox', { name: /message/i }).fill('Checking the form semantics from a real browser.');

    await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue('A11y Tester');
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue('tester@example.com');
    await expect(page.getByRole('textbox', { name: /message/i })).toHaveValue(/real browser/);
    await expect(page.getByRole('main').getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });
});
