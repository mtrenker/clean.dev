import { expect, test } from '@playwright/test';
import { projects } from '../src/app/projects';
import { buildDouglasWorkCase, isDouglasProject } from '../src/app/work/douglas-case';
import { SUPPORTED_LOCALES, type Locale } from '../src/lib/locale';
import { inspectPdf, searchablePdfText } from './helpers/pdf';

const HISTORY_HEADINGS: Record<Locale, string> = {
  en: 'Project history',
  de: 'Projekthistorie',
};

test.describe('work print CV', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'Print uses the desktop document');

  for (const locale of SUPPORTED_LOCALES) {
    test(`prints a dedicated A4 CV document (${locale})`, async ({ page, context, baseURL, browserName }, testInfo) => {
      await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: baseURL ?? 'http://127.0.0.1:3000' }]);
      await page.goto('/work');

      // On screen the print document must stay invisible and the normal view intact.
      const printDocument = page.locator('[data-print-document]');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(printDocument).toBeHidden();

      // Under print media the roles flip: CV visible, site chrome and screen view gone.
      await page.emulateMedia({ media: 'print' });
      await expect(printDocument).toBeVisible();
      // Site chrome (nav header, footer, skip link) sits at body level; the print
      // document nests its own header/footer, so scope to direct body children.
      await expect(page.locator('body > header')).toBeHidden();
      await expect(page.locator('body > footer')).toBeHidden();
      await expect(page.locator('#main-content')).toBeHidden();

      const text = await printDocument.innerText();
      expect(text).toContain('Martin Trenker');
      expect(text).toContain('info@clean.dev');
      expect(text).toContain(HISTORY_HEADINGS[locale]);
      await expect(printDocument.locator('[data-print-certifications]')).toContainText('AWS Certified Developer');
      // The complete chronology remains present, with Douglas represented as
      // one progression-based engagement instead of two repeated entries.
      for (const project of projects.filter((candidate) => !isDouglasProject(candidate))) {
        expect(text).toContain(project.company ?? project.industry?.[locale] ?? project.id);
        expect(text).toContain(project.description[locale]);
      }
      const douglasCase = buildDouglasWorkCase(projects, locale);
      expect(text.toLocaleLowerCase(locale)).toContain(douglasCase.role.toLocaleLowerCase(locale));
      expect(text).toContain(douglasCase.mandate);
      expect(text.match(/Douglas GmbH/g)).toHaveLength(1);
      for (const step of douglasCase.progression) expect(text).toContain(step.body);

      // Firefox/Cairo used to outline the Google Fonts version of Source Sans 3.
      // Check the static print face in both engines, including every used weight.
      await page.evaluate(() => document.fonts.ready);
      await expect(printDocument.locator('h1')).toHaveCSS('font-family', /Source Sans 3 Print/);
      const loaded = await page.evaluate(() => [400, 500, 600].every((weight) => (
        document.fonts.check(`${weight} 12px "Source Sans 3 Print"`, 'Martin München')
      )));
      expect(loaded).toBe(true);

      // Playwright exposes PDF export only for Chromium. Firefox still executes
      // all layout, content, and print-font assertions above.
      if (browserName !== 'chromium') return;

      const pdfPath = testInfo.outputPath(`work-cv-${locale}.pdf`);
      const pdf = await page.pdf({ format: 'A4', printBackground: true, path: pdfPath });
      expect(pdf.byteLength).toBeGreaterThan(20_000);
      await testInfo.attach(`work-cv-${locale}.pdf`, { path: pdfPath, contentType: 'application/pdf' });
      const exported = await inspectPdf(pdfPath);
      expect(exported.fonts).toMatch(/SourceSans3-Regular\s+CID TrueType/);
      expect(exported.fonts).toMatch(/SourceSans3-Semibold\s+CID TrueType/i);
      const searchable = searchablePdfText(exported.text);
      for (const expected of ['Martin Trenker', 'info@clean.dev', HISTORY_HEADINGS[locale], douglasCase.company, douglasCase.mandate]) {
        expect(searchable).toContain(searchablePdfText(expected));
      }
      for (const project of projects.filter((candidate) => !isDouglasProject(candidate))) {
        expect(searchable).toContain(searchablePdfText(project.company ?? project.industry?.[locale] ?? project.id));
        expect(searchable).toContain(searchablePdfText(project.description[locale]));
      }
      for (const step of douglasCase.progression) {
        expect(searchable).toContain(searchablePdfText(step.body));
      }
    });
  }
});
