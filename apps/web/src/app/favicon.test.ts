import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const readAsset = (name: string): Buffer => fs.readFileSync(path.join(appDirectory, name));

const readPngDimensions = (png: Buffer): { width: number; height: number } => {
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
};

describe('favicon assets', () => {
  it('uses the established clean.dev mark and brand palette for the scalable icon', () => {
    const icon = readAsset('icon.svg').toString('utf8');

    expect(icon).toContain('viewBox="0 0 32 32"');
    expect(icon).toContain('fill="#14130f"');
    expect(icon).toContain('stroke="#8b3f24"');
    expect(icon).toContain('fill="#d96e3f"');
    expect(icon).toContain('<path d="M9.5 25.5H14l8.5-19H18z"');
  });

  it('provides an Apple touch icon at the conventional size', () => {
    expect(readPngDimensions(readAsset('apple-icon.png'))).toEqual({
      width: 180,
      height: 180,
    });
  });

  it('provides 16, 32, and 48 pixel images in the ICO fallback', () => {
    const icon = readAsset('favicon.ico');
    expect(icon.readUInt16LE(0)).toBe(0);
    expect(icon.readUInt16LE(2)).toBe(1);

    const count = icon.readUInt16LE(4);
    const dimensions = Array.from({ length: count }, (_, index) => {
      const entryOffset = 6 + index * 16;
      const width = icon.readUInt8(entryOffset) || 256;
      const height = icon.readUInt8(entryOffset + 1) || 256;
      const imageSize = icon.readUInt32LE(entryOffset + 8);
      const imageOffset = icon.readUInt32LE(entryOffset + 12);
      const image = icon.subarray(imageOffset, imageOffset + imageSize);

      expect(readPngDimensions(image)).toEqual({ width, height });
      return { width, height };
    });

    expect(dimensions).toEqual([
      { width: 16, height: 16 },
      { width: 32, height: 32 },
      { width: 48, height: 48 },
    ]);
  });
});
