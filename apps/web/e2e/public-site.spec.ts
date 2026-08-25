import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getAllPosts } from '../src/lib/blog';

const posts = getAllPosts();
const publicRoutes = ['/', '/work', '/contact', '/blog', '/imprint', '/privacy', '/workflow-simulator'];
const siteThemes = ['dark', 'light'] as const;
const protonBookingUrl = 'https://calendar.proton.me/bookings#gr6YDfkOKjAMY1niO0UPh2HmFBm4FnVWYJaeshmt0IM=';

const useSiteTheme = async (page: Page, theme: typeof siteThemes[number]) => {
  await page.addInitScript((siteTheme) => {
    window.localStorage.setItem('clean.dev.site-theme', siteTheme);
  }, theme);
};

const primaryPages = [
  { path: '/', heading: /hands-on technical leadership/i },
  { path: '/work', heading: /technical lead and solutions architect/i },
  { path: '/contact', heading: /tell me what needs to change/i },
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

  test('the three-item navigation fits the narrowest supported width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    const layout = await page.evaluate(() => {
      const documentElement = document.documentElement;
      const mobileNavigation = document.querySelector<HTMLElement>('nav.fixed[aria-label="Main navigation"] > ul');
      const navigationBox = mobileNavigation?.getBoundingClientRect();

      return {
        overflow: documentElement.scrollWidth - documentElement.clientWidth,
        navigationWidth: navigationBox?.width,
        availableWidth: documentElement.clientWidth - 24,
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.navigationWidth).toBeDefined();
    expect(layout.navigationWidth!).toBeLessThanOrEqual(layout.availableWidth);
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

  test('profile role renders safely at the narrowest supported width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const expectWrappedProfileRole = async (role: string) => {
      const profileMeta = page.locator('p').filter({ hasText: role }).first();
      await expect(profileMeta).toBeVisible();
      const layout = await profileMeta.evaluate((element, expectedRole) => {
        const textNode = Array.from(element.childNodes).find((node) => (
          node.nodeType === Node.TEXT_NODE && node.textContent?.includes(expectedRole)
        ));
        if (!textNode?.textContent) return null;

        const start = textNode.textContent.indexOf(expectedRole);
        const range = document.createRange();
        range.setStart(textNode, start);
        range.setEnd(textNode, start + expectedRole.length);
        const rects = Array.from(range.getClientRects());

        return {
          bottom: Math.max(...rects.map((rect) => rect.bottom)),
          documentWidth: document.documentElement.scrollWidth,
          left: Math.min(...rects.map((rect) => rect.left)),
          right: Math.max(...rects.map((rect) => rect.right)),
          top: Math.min(...rects.map((rect) => rect.top)),
          viewportWidth: window.innerWidth,
        };
      }, role);

      const profileCard = profileMeta.locator('xpath=ancestor::div[contains(@class, "rounded-[6px]")][1]');
      const cardBox = await profileCard.boundingBox();

      expect(layout).not.toBeNull();
      expect(cardBox).not.toBeNull();
      expect(layout!.left).toBeGreaterThanOrEqual(cardBox!.x);
      expect(layout!.right).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
      expect(layout!.top).toBeGreaterThanOrEqual(cardBox!.y);
      expect(layout!.bottom).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
      expect(layout!.right).toBeLessThanOrEqual(layout!.viewportWidth);
      expect(layout!.documentWidth).toBeLessThanOrEqual(layout!.viewportWidth);
    };

    await expectWrappedProfileRole('technical lead and solutions architect');
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();
    await expectWrappedProfileRole('Technical Lead und Solutions Architect');
  });

  test('homepage leads with verified project evidence and does not promote an empty blog', async ({ page }) => {
    await page.goto('/');

    const main = page.getByRole('main');
    await expect(main.getByText('20', { exact: true }).first()).toBeVisible();
    await expect(main.getByText(/react expert → technical lead → solutions architect/i).first()).toBeVisible();
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

  test('homepage presents the approved lower-page sections in order', async ({ page }) => {
    await page.goto('/');

    const headings = await page.getByRole('main').getByRole('heading', { level: 2 }).allTextContents();
    expect(headings).toEqual([
      'Verified enterprise outcomes',
      'Bring me in when',
      'How I help',
      'Ways to work together',
      'How I work',
      'Questions I get asked',
      'Engagement log',
      "Let's talk",
    ]);
  });

  test('How I help is reachable from every public route with pointer and keyboard', async ({ page }) => {
    for (const route of ['/', '/work', '/contact']) {
      await page.goto(route);
      await page.getByRole('link', { name: 'How I help', exact: true }).click();
      await expect(page).toHaveURL(/\/#how-i-help$/);

      const pointerResult = await page.locator('#how-i-help').evaluate((section) => ({
        top: section.getBoundingClientRect().top,
        activeElementId: document.activeElement?.id,
        focusVisible: section.matches(':focus-visible'),
      }));
      expect(pointerResult.top).toBeCloseTo(96, 0);
      expect(pointerResult.activeElementId).toBe('how-i-help');
      expect(pointerResult.focusVisible).toBe(false);

      await page.goto(route);
      const navigationLink = page.getByRole('link', { name: 'How I help', exact: true });
      await navigationLink.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/#how-i-help$/);

      const keyboardResult = await page.locator('#how-i-help').evaluate((section) => ({
        top: section.getBoundingClientRect().top,
        activeElementId: document.activeElement?.id,
        focusVisible: section.matches(':focus-visible'),
      }));
      expect(keyboardResult.top).toBeCloseTo(96, 0);
      expect(keyboardResult.activeElementId).toBe('how-i-help');
      expect(keyboardResult.focusVisible).toBe(true);
    }

    await page.goto('/#how-i-help');
    const directEntryResult = await page.locator('#how-i-help').evaluate((section) => ({
      top: section.getBoundingClientRect().top,
      activeElementId: document.activeElement?.id,
      focusVisible: section.matches(':focus-visible'),
    }));
    expect(directEntryResult.top).toBeCloseTo(96, 0);
    expect(directEntryResult.activeElementId).toBe('how-i-help');
    expect(directEntryResult.focusVisible).toBe(true);
  });

  test('browser back after How I help restores the previous view', async ({ page }) => {
    await page.goto('/work');
    await page.evaluate(() => window.scrollTo(0, 320));
    await page.getByRole('link', { name: 'How I help', exact: true }).click();
    await expect(page).toHaveURL(/\/#how-i-help$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/work$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 320));
    await page.getByRole('link', { name: 'How I help', exact: true }).click();
    await expect(page).toHaveURL(/\/#how-i-help$/);
    await page.goBack();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('');
  });

  test('engagement formats state cadence without promising availability', async ({ page }) => {
    await page.goto('/');

    for (const text of [
      'Embedded Technical Lead or Solutions Architect',
      '3–5 days per week · typically 3–9 months',
      'Architecture and Delivery Assessment',
      'usually 5–10 working days',
      'AI-enabled Engineering Advisory',
      'usually 1 day per week or a fixed-scope package',
      'Cadence and duration are agreed per engagement and depend on current availability.',
    ]) {
      await expect(page.getByRole('main').getByText(text, { exact: true })).toBeVisible();
    }
  });

  test('AI trust content states client-approved and reviewable use', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 3, name: 'How do you use AI in client work?' })).toBeVisible();
    await expect(page.getByText(/only within the client's approved security and data-handling constraints.*keep important actions reviewable/i)).toBeVisible();

    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();
    await expect(page.getByRole('heading', { level: 3, name: 'Wie setzen Sie KI in Kundenprojekten ein?' })).toBeVisible();
    await expect(page.getByText(/nur innerhalb der freigegebenen sicherheits- und datenschutzvorgaben.*halte wichtige aktionen überprüfbar/i)).toBeVisible();
  });

  test('German lower homepage matches the approved copy', async ({ page }) => {
    await page.goto('/');
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    const headings = await page.getByRole('main').getByRole('heading', { level: 2 }).allTextContents();
    expect(headings).toEqual([
      'Belegte Enterprise-Ergebnisse',
      'Wann Sie mich dazuholen sollten',
      'Wie ich helfe',
      'Formen der Zusammenarbeit',
      'Wie ich arbeite',
      'Häufige Fragen',
      'Projektauszug',
      'Lassen Sie uns reden',
    ]);
    await expect(page.getByText('Kein Transformationstheater, keine praxisfernen Foliensätze, keine KI-Einführung als Selbstzweck.', { exact: true })).toBeVisible();

    for (const title of [
      'Embedded Technical Lead oder Solutions Architect',
      'Architektur- und Delivery-Assessment',
      'KI-Beratung für Engineering-Teams',
    ]) {
      await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
    }
  });

  test('work page supports recruiter scanning and localized dossier download', async ({ page }) => {
    await page.goto('/work');

    await expect(page.getByRole('heading', { level: 1, name: 'Technical Lead and Solutions Architect.' })).toBeVisible();
    await expect(page.getByText(/available from september 2026 · 2–5 days\/week · munich and remote dach · german and english/i).first()).toBeVisible();
    await expect(page.getByText(/architecture modernisation · delivery reliability · governed ai workflows/i)).toBeVisible();
    await expect(page.getByText('dotnet', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discuss a project' }).first()).toBeVisible();

    const downloadLink = page.getByRole('link', { name: 'Download the English project dossier as Markdown' });
    await expect(downloadLink).toHaveAttribute('href', '/work/dossier?locale=en');
    const englishResponse = await page.request.get('/work/dossier?locale=en');
    expect(englishResponse.headers()['content-type']).toBe('text/markdown; charset=utf-8');
    expect(englishResponse.headers()['content-disposition']).toContain('martin-trenker-project-dossier-en.md');
    const englishDossier = await englishResponse.text();
    expect(englishDossier).toContain('# Project dossier: Martin Trenker');
    expect(englishDossier).toContain('## Recent projects');

    const selectedProjectsSection = page.getByRole('heading', { level: 2, name: 'Selected projects' }).locator('xpath=ancestor::section[1]');
    const selectedCompanies = await selectedProjectsSection.getByRole('heading', { level: 3 }).allTextContents();
    expect(selectedCompanies).toEqual(['Douglas GmbH', 'Oetker Digital GmbH', 'Fielmann AG']);
    await expect(selectedProjectsSection.getByText('Measured fact').first()).toBeVisible();
    await expect(selectedProjectsSection.getByText('Unmeasured observation').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Current hands-on systems' })).toBeVisible();
    await expect(page.getByText(/issue-scoped agent → isolated worktree → deterministic test and build gates → human-reviewed pull request/i).first()).toBeVisible();

    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1, name: 'Technical Lead und Solutions Architect.' })).toBeVisible();
    await expect(page.getByText(/verfügbar ab september 2026 · 2–5 tage\/woche · münchen und remote im dach-raum · deutsch und englisch/i).first()).toBeVisible();
    const germanDownload = page.getByRole('link', { name: 'Deutsches Projektdossier als Markdown herunterladen' });
    await expect(germanDownload).toHaveAttribute('href', '/work/dossier?locale=de');
    const germanResponse = await page.request.get('/work/dossier?locale=de');
    expect(germanResponse.headers()['content-language']).toBe('de');
    expect(await germanResponse.text()).toContain('# Projektdossier: Martin Trenker');
  });

  test('contact offers the localized Proton booking action without replacing the form', async ({ page }) => {
    await page.goto('/contact');

    const englishBooking = page.getByRole('link', {
      name: 'Book an introductory call in Proton Calendar (opens in a new tab)',
    });
    await expect(englishBooking).toBeVisible();
    await expect(englishBooking).toHaveAttribute('href', protonBookingUrl);
    await expect(englishBooking).toHaveAttribute('target', '_blank');
    await expect(page.getByRole('button', { name: 'Send project context' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Engagement type (optional)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Not sure yet' })).toHaveCount(1);

    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    const germanBooking = page.getByRole('link', {
      name: 'Erstgespräch in Proton Calendar buchen (öffnet in einem neuen Tab)',
    });
    await expect(germanBooking).toBeVisible();
    await expect(germanBooking).toHaveAttribute('href', protonBookingUrl);
    await expect(page.getByRole('button', { name: 'Projektkontext senden' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Engagement-Art (optional)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Noch nicht sicher' })).toHaveCount(1);
  });

  test('the empty blog is excluded from search indexing', async ({ page }) => {
    test.skip(posts.length > 0, 'Only applies while the blog is empty.');
    await page.goto('/blog');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('Douglas is one targetable progression case in English and German', async ({ page }) => {
    await page.goto('/');
    const douglasLink = page.getByRole('link', { name: 'Douglas', exact: true }).first();
    await expect(douglasLink).toHaveAttribute('href', '/work#douglas');
    await douglasLink.click();
    await expect(page).toHaveURL(/\/work#douglas$/);

    const workCase = page.locator('#douglas');
    await expect(workCase).toHaveCount(1);
    const [caseBox, headerBox] = await Promise.all([workCase.boundingBox(), page.getByRole('banner').boundingBox()]);
    expect(caseBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(caseBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
    await expect(workCase.getByRole('heading', { level: 3, name: 'Douglas GmbH' })).toBeVisible();
    await expect(workCase.getByText('React Expert → Technical Lead → Solutions Architect', { exact: true })).toBeVisible();
    await expect(workCase.getByRole('heading', { name: 'Role progression' })).toBeVisible();
    await expect(workCase.getByRole('heading', { name: 'Personal ownership' })).toBeVisible();
    await expect(workCase.getByRole('heading', { name: 'Team delivery and contribution' })).toBeVisible();
    await expect(workCase.getByText(/1,800 stores across 26 european countries/i).first()).toBeVisible();
    await expect(workCase.getByText(/personally designed and shipped the unified api/i)).toBeVisible();
    await expect(workCase.getByText(/governed access to jira, confluence, azure devops/i)).toBeVisible();
    await expect(workCase.getByText(/picked up c#\/\.net/i)).toHaveCount(0);

    const caseAxeResults = await new AxeBuilder({ page })
      .include('#douglas')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(caseAxeResults.violations).toEqual([]);

    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'de', url: page.url() }]);
    await page.reload();

    await expect(workCase.getByText('React-Experte → Technical Lead → Solutions Architect', { exact: true })).toBeVisible();
    await expect(workCase.getByRole('heading', { name: 'Rollenentwicklung' })).toBeVisible();
    await expect(workCase.getByRole('heading', { name: 'Persönliche Verantwortung' })).toBeVisible();
    await expect(workCase.getByText(/einheitliche API persönlich konzipiert und umgesetzt/i)).toBeVisible();
    await expect(workCase.getByText(/C#\/\.NET im laufenden Projekt gelernt/i)).toHaveCount(0);
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

      const booking = page.getByRole('link', { name: /book an introductory call in proton calendar/i });
      const name = page.getByRole('textbox', { name: /name/i });
      const email = page.getByRole('textbox', { name: /email/i });
      const message = page.getByRole('textbox', { name: /message/i });
      const company = page.getByRole('textbox', { name: /company \(optional\)/i });
      const desiredStart = page.getByLabel(/desired start date \(optional\)/i);
      const expectedDays = page.getByRole('textbox', { name: /expected days per week \(optional\)/i });
      const onsiteModel = page.getByRole('textbox', { name: /onsite model \(optional\)/i });
      const engagementType = page.getByRole('combobox', { name: /engagement type \(optional\)/i });
      const budgetRange = page.getByRole('textbox', { name: /budget or rate range \(optional\)/i });
      const submit = page.getByRole('button', { name: /send project context/i });
      const controls = [
        booking,
        name,
        email,
        message,
        company,
        desiredStart,
        expectedDays,
        onsiteModel,
        engagementType,
        budgetRange,
        submit,
      ];

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
