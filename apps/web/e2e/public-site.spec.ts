import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicRoutes = ['/', '/work', '/contact', '/blog', '/imprint', '/privacy', '/workflow-simulator'];
const siteThemes = ['dark', 'light'] as const;

const useSiteTheme = async (page: Page, theme: typeof siteThemes[number]) => {
  await page.addInitScript((siteTheme) => {
    window.localStorage.setItem('clean.dev.site-theme', siteTheme);
  }, theme);
};

const primaryPages = [
  { path: '/', heading: /hands-on technical leadership/i },
  { path: '/work', heading: /project history from inside real teams/i },
  { path: '/contact', heading: /discuss a project/i },
  { path: '/workflow-simulator', heading: /systems thinking playground/i },
];

const primaryTapTargets = [
  /discuss a project/i,
  /see relevant work/i,
  /work/i,
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
    await expect(page.getByRole('heading', { level: 1, name: /hands-on technical leadership/i })).toBeVisible();

    for (const name of primaryTapTargets) {
      await expect(page.getByRole('link', { name }).first()).toBeVisible();
    }
  });

  test('primary homepage actions are visible without scrolling and have comfortable targets', async ({ page }) => {
    await page.goto('/');

    for (const name of [/discuss a project/i, /see relevant work/i]) {
      const target = page.getByRole('link', { name }).first();
      const box = await target.boundingBox();
      expect(box, `${name} should be visible and measurable`).not.toBeNull();
      expect(box!.height, `${name} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
      expect(box!.width, `${name} should be at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height, `${name} should be visible without scrolling`).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerHeight),
      );
    }
  });

  test('homepage leads with verified project evidence and does not promote an empty blog', async ({ page }) => {
    await page.goto('/');

    const main = page.getByRole('main');
    await expect(main.getByText('20', { exact: true }).first()).toBeVisible();
    await expect(main.getByText(/technical lead \/ solutions architect/i).first()).toBeVisible();
    await expect(main.getByText(/1,800 stores across 26 european countries/i).first()).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: /articles/i })).toHaveCount(0);
    await expect(main.getByRole('link', { name: /read articles/i })).toHaveCount(0);
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

  test('the empty blog is excluded from search indexing', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('German positioning preserves the approved commercial facts', async ({ page }) => {
    await page.goto('/');
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1, name: /technische führung mit hands-on-mentalität/i })).toBeVisible();
    await expect(page.getByText(/verfügbar ab september 2026 · 2–5 tage\/woche · deutsch und englisch/i).first()).toBeVisible();

    for (const name of [/projekt besprechen/i, /projekte ansehen/i]) {
      const action = page.getByRole('link', { name }).first();
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight));
    }
  });

  test('skip link moves keyboard users to the main content', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  for (const theme of siteThemes) {
    test(`contact accessibility, presentation, and keyboard focus remain intact in ${theme} theme`, async ({ page }) => {
      await useSiteTheme(page, theme);
      await page.goto('/contact');

      const name = page.getByRole('textbox', { name: /name/i });
      const email = page.getByRole('textbox', { name: /email/i });
      const message = page.getByRole('textbox', { name: /message/i });
      const submit = page.getByRole('button', { name: /send message/i });
      const controls = [name, email, message, submit];

      for (const field of [name, email, message]) {
        await expect(field).toBeVisible();
        await expect(field).toHaveAttribute('required', '');
      }
      await expect(submit).toBeVisible();

      const presentation = await page.evaluate(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const resolveColour = (property: string) => {
          const probe = document.createElement('span');
          probe.style.color = `var(${property})`;
          document.body.append(probe);
          const colour = getComputedStyle(probe).color;
          probe.remove();
          return colour;
        };
        const firstField = document.querySelector<HTMLInputElement>('#name')!;
        const firstLabel = document.querySelector<HTMLLabelElement>('label[for="name"]')!;
        const button = document.querySelector<HTMLButtonElement>('button[type="submit"]')!;

        return {
          theme: document.documentElement.dataset.siteTheme,
          fieldBackground: getComputedStyle(firstField).backgroundColor,
          fieldText: getComputedStyle(firstField).color,
          labelText: getComputedStyle(firstLabel).color,
          buttonBackground: getComputedStyle(button).backgroundColor,
          buttonText: getComputedStyle(button).color,
          siteBackground: resolveColour('--site-bg'),
          siteInk: resolveColour('--site-ink'),
          siteRust: resolveColour('--site-rust'),
          colourScheme: rootStyles.colorScheme,
        };
      });

      expect(presentation).toMatchObject({
        theme,
        fieldBackground: presentation.siteBackground,
        fieldText: presentation.siteInk,
        labelText: presentation.siteInk,
        buttonBackground: presentation.siteRust,
        buttonText: presentation.siteBackground,
        colourScheme: theme,
      });

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .disableRules(['landmark-unique'])
        .analyze();
      expect(axeResults.violations).toEqual([]);

      for (const control of controls) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
          if (await control.evaluate((element) => document.activeElement === element)) break;
          await page.keyboard.press('Tab');
        }
        await expect(control).toBeFocused();
        await expect.poll(() => control.evaluate((element) => getComputedStyle(element).boxShadow))
          .not.toBe('none');
      }

      await name.fill('A11y Tester');
      await email.fill('tester@example.com');
      await message.fill('Checking the form semantics from a real browser.');

      await expect(name).toHaveValue('A11y Tester');
      await expect(email).toHaveValue('tester@example.com');
      await expect(message).toHaveValue(/real browser/);
      await expect(page.getByRole('main').getByRole('link', { name: /privacy policy/i })).toBeVisible();
    });
  }
});
