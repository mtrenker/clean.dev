import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Poppler checks the exported artifact, not the HTML that generated it. */
export const inspectPdf = async (path: string) => {
  const [text, fonts] = await Promise.all([
    execFileAsync('pdftotext', ['-raw', '-enc', 'UTF-8', path, '-']),
    execFileAsync('pdffonts', [path]),
  ]);
  return { text: text.stdout, fonts: fonts.stdout };
};

/** Ignore pagination, typographic ligatures, and automatic line hyphenation. */
export const searchablePdfText = (text: string) => text
  .normalize('NFKC')
  .replace(/[\s\u00ad\u2010\u2011-]+/g, '');
