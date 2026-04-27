import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Hsl = { h: number; s: number; l: number };

const TOKENS_PATH = path.resolve(__dirname, '../styles/tokens.css');
const tokensCss = fs.readFileSync(TOKENS_PATH, 'utf8');

const extractBlock = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tokensCss.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  if (!match) throw new Error(`Could not find CSS token block: ${selector}`);
  return match[1];
};

const extractHslTokens = (block: string) => {
  const tokens = new Map<string, Hsl>();
  const tokenPattern = /--([a-z-]+):\s*([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%\s*;/g;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(block))) {
    tokens.set(match[1], {
      h: Number(match[2]),
      s: Number(match[3]),
      l: Number(match[4]),
    });
  }

  return tokens;
};

const hslToRgb = ({ h, s, l }: Hsl) => {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hue = h / 60;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const m = lightness - chroma / 2;

  const [r1, g1, b1] =
    hue >= 0 && hue < 1 ? [chroma, x, 0]
    : hue >= 1 && hue < 2 ? [x, chroma, 0]
    : hue >= 2 && hue < 3 ? [0, chroma, x]
    : hue >= 3 && hue < 4 ? [0, x, chroma]
    : hue >= 4 && hue < 5 ? [x, 0, chroma]
    : [chroma, 0, x];

  return [r1 + m, g1 + m, b1 + m].map((channel) => Math.round(channel * 255));
};

const relativeLuminance = (hsl: Hsl) => {
  const [r, g, b] = hslToRgb(hsl).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (foreground: Hsl, background: Hsl) => {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getToken = (tokens: Map<string, Hsl>, name: string) => {
  const token = tokens.get(name);
  if (!token) throw new Error(`Missing CSS token: --${name}`);
  return token;
};

const rootTokens = extractHslTokens(extractBlock(':root'));
const darkTokens = new Map([...rootTokens, ...extractHslTokens(extractBlock('.dark'))]);

const contrastPairs = [
  ['foreground', 'background', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['card-foreground', 'card', 4.5],
  ['foreground', 'card', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['destructive-foreground', 'destructive', 4.5],
  ['warning-foreground', 'warning', 4.5],
  ['info-foreground', 'info', 4.5],
] as const;

describe('design token accessibility', () => {
  it.each(contrastPairs)('keeps :root --%s readable on --%s', (foreground, background, minimum) => {
    const ratio = contrastRatio(getToken(rootTokens, foreground), getToken(rootTokens, background));
    expect(ratio, `--${foreground} on --${background} contrast`).toBeGreaterThanOrEqual(minimum);
  });

  it.each(contrastPairs)('keeps .dark --%s readable on --%s', (foreground, background, minimum) => {
    const ratio = contrastRatio(getToken(darkTokens, foreground), getToken(darkTokens, background));
    expect(ratio, `.dark --${foreground} on --${background} contrast`).toBeGreaterThanOrEqual(minimum);
  });
});
