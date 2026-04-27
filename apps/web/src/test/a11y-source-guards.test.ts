import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = path.resolve(__dirname, '..');
const MIN_TEXT_SIZE_PX = 12;
const MIN_TEXT_SIZE_REM = 0.75;

const walk = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['.next', 'storybook-static', '__snapshots__'].includes(entry.name)) return [];
      return walk(absolute);
    }

    if (!/\.(css|tsx?)$/.test(entry.name)) return [];
    if (/\.test\.tsx?$/.test(entry.name) || /\.stories\.tsx$/.test(entry.name)) return [];
    return [absolute];
  });
};

const sourceFiles = walk(SRC_ROOT);

const lineAndColumn = (content: string, index: number) => {
  const before = content.slice(0, index);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
};

const findTinyTextUtilities = () => {
  const findings: string[] = [];
  const arbitraryTextClass = /text-\[(\d*\.?\d+)(px|rem)\]/g;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;

    while ((match = arbitraryTextClass.exec(content))) {
      const value = Number(match[1]);
      const unit = match[2];
      const tooSmall = unit === 'px' ? value < MIN_TEXT_SIZE_PX : value < MIN_TEXT_SIZE_REM;

      if (tooSmall) {
        const { line, column } = lineAndColumn(content, match.index);
        findings.push(`${path.relative(SRC_ROOT, file)}:${line}:${column} uses ${match[0]}`);
      }
    }
  }

  return findings;
};

const findTinyCssFontSizes = () => {
  const findings: string[] = [];
  const fontSizeDeclaration = /font-size\s*:\s*(\d*\.?\d+)(px|rem)\b/g;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;

    while ((match = fontSizeDeclaration.exec(content))) {
      const value = Number(match[1]);
      const unit = match[2];
      const tooSmall = unit === 'px' ? value < MIN_TEXT_SIZE_PX : value < MIN_TEXT_SIZE_REM;

      if (tooSmall) {
        const { line, column } = lineAndColumn(content, match.index);
        findings.push(`${path.relative(SRC_ROOT, file)}:${line}:${column} uses font-size:${match[1]}${unit}`);
      }
    }
  }

  return findings;
};

describe('source accessibility guards', () => {
  it('does not introduce arbitrary text sizes below 12px', () => {
    expect(findTinyTextUtilities()).toEqual([]);
    expect(findTinyCssFontSizes()).toEqual([]);
  });
});
