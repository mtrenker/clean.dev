import { expect, test } from '@playwright/test';
import { practiceBrief } from '../src/app/work/ai-assisted-engineering/practice-brief';

const ROUTE = '/work/ai-assisted-engineering';

/**
 * Counts pages in a Chromium-generated PDF. The page objects appear as plain
 * `/Type /Page` dictionary entries; `[^s]` excludes the `/Type /Pages` node of
 * the page tree.
 */
const countPdfPages = (pdf: Buffer) => pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;

test.describe('AI-assisted engineering practice brief', () => {
  test('renders the brief and keeps the print document off screen', async ({ page }) => {
    await page.goto(ROUTE);

    await expect(page.getByRole('heading', { level: 1, name: practiceBrief.title })).toBeVisible();
    await expect(page.getByRole('button', { name: practiceBrief.print.action })).toBeVisible();
    await expect(page.locator('[data-print-document]')).toBeHidden();
    await expect(page.locator('main#main-content')).toHaveAttribute('lang', 'en');
  });

  test('asks search engines not to index it', async ({ page }) => {
    await page.goto(ROUTE);

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('noindex');
  });

  test('is reachable only by its URL, never from a public page', async ({ page }) => {
    for (const route of ['/', '/work', '/contact']) {
      await page.goto(route);
      await expect(page.locator('a[href*="ai-assisted-engineering"]')).toHaveCount(0);
    }
  });

  test('stays inside the viewport on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(ROUTE);

    const overflow = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('reaches the print action by keyboard with the focus visible', async ({ page }) => {
    await page.goto(ROUTE);

    const printButton = page.getByRole('button', { name: practiceBrief.print.action });
    await printButton.focus();
    await expect(printButton).toBeFocused();
    await expect(printButton).toHaveClass(/focus-visible:ring-2/);
  });

  test.describe('print output', () => {
    test.skip(
      ({ browserName, isMobile }) => browserName !== 'chromium' || Boolean(isMobile),
      'PDF export requires desktop Chromium',
    );

    test('prints exactly one A4 page carrying the whole brief', async ({ page }, testInfo) => {
      await page.goto(ROUTE);
      await page.emulateMedia({ media: 'print' });

      const printDocument = page.locator('[data-print-document]');
      await expect(printDocument).toBeVisible();
      // Site chrome and the screen composition sit at body level and must go.
      await expect(page.locator('body > header')).toBeHidden();
      await expect(page.locator('body > footer')).toBeHidden();
      await expect(page.locator('#main-content')).toBeHidden();
      await expect(page.getByRole('button', { name: practiceBrief.print.action })).toBeHidden();

      const text = await printDocument.innerText();
      expect(text).toContain(practiceBrief.title);
      expect(text).toContain(practiceBrief.subtitle);
      expect(text).toContain('Douglas');
      expect(text).toContain('info@clean.dev');
      expect(text).toContain('That is not privacy.');
      for (const stage of practiceBrief.workflow.stages) expect(text).toContain(stage.label);
      for (const maturity of practiceBrief.client.maturities) expect(text).toContain(maturity.label);
      for (const entry of practiceBrief.tools.entries) expect(text).toContain(entry.name);
      for (const claim of practiceBrief.client.claims) expect(text).toContain(claim.label);
      for (const item of practiceBrief.practice.items) expect(text).toContain(item.label);
      for (const item of practiceBrief.limits.items) expect(text).toContain(item.label);

      const pdfPath = testInfo.outputPath('ai-practice-brief.pdf');
      const pdf = await page.pdf({ format: 'A4', printBackground: true, path: pdfPath });
      await testInfo.attach('ai-practice-brief.pdf', { path: pdfPath, contentType: 'application/pdf' });

      expect(countPdfPages(pdf)).toBe(1);
      expect(pdf.toString('latin1')).toMatch(/\/Count\s+1\b/);
    });
  });
});
