import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { SOCIAL_IMAGE_ALT } from '@/lib/site-metadata';

export const alt = SOCIAL_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

const resolveFontDir = (): string => {
  const candidates = [
    path.join(process.cwd(), 'src/app/_fonts'),
    path.join(process.cwd(), 'apps/web/src/app/_fonts'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
};

const fontDir = resolveFontDir();
const readFont = (filename: string): ArrayBuffer => {
  const data = fs.readFileSync(path.join(fontDir, filename));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
};

const sourceSansRegular = readFont('SourceSans3-Regular.ttf');
const sourceSansSemiBold = readFont('SourceSans3-SemiBold.ttf');
const ibmPlexMonoSemiBold = readFont('IBMPlexMono-SemiBold.ttf');

const mono = 'IBM Plex Mono';
const sans = 'Source Sans 3';

const OpenGraphImage = () => new ImageResponse(
  (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '1200px',
        height: '630px',
        overflow: 'hidden',
        background: '#14130f',
        color: '#ede7d4',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', left: 56, top: 64, height: 44, alignItems: 'center', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #8b3f24',
            borderRadius: 4,
            color: '#d96e3f',
            fontFamily: mono,
            fontSize: 24,
            fontWeight: 600,
            lineHeight: '44px',
          }}
        >
          /
        </div>
        <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, letterSpacing: 3.4, lineHeight: '44px' }}>
          CLEAN.DEV
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 56,
          top: 150,
          height: 44,
          alignItems: 'center',
          border: '1px solid #8b3f24',
          borderRadius: 2,
          padding: '10px 16px',
          color: '#d96e3f',
          fontFamily: mono,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 3.84,
          lineHeight: '24px',
        }}
      >
        INDEPENDENT CONSULTANT · MUNICH AND REMOTE DACH
      </div>

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 248,
          height: 104,
          color: '#ede7d4',
          fontFamily: sans,
          fontSize: 104,
          fontWeight: 600,
          letterSpacing: -5.2,
          lineHeight: '104px',
        }}
      >
        Martin Trenker
      </div>

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 376,
          height: 52,
          color: '#c4bda9',
          fontFamily: sans,
          fontSize: 44,
          fontWeight: 400,
          letterSpacing: -0.88,
          lineHeight: '52px',
        }}
      >
        Technical Lead and Solutions Architect
      </div>

      <div style={{ position: 'absolute', left: 0, top: 490, width: 1200, height: 1, background: '#2c2924' }} />

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 532,
          height: 30,
          color: '#7eaf6a',
          fontFamily: mono,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 2.6,
          lineHeight: '30px',
        }}
      >
        INSIDE THE WORK. SHARPER DELIVERY. AI WITH JUDGMENT.
      </div>
    </div>
  ),
  {
    ...size,
    fonts: [
      { name: sans, data: sourceSansRegular, weight: 400 },
      { name: sans, data: sourceSansSemiBold, weight: 600 },
      { name: mono, data: ibmPlexMonoSemiBold, weight: 600 },
    ],
  },
);

export default OpenGraphImage;
