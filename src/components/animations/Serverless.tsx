import { useEffect, useRef, VFC } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import 'highlight.js/styles/github.css';
import { css } from '@emotion/react';
import { useMachine } from '@xstate/react';

import { interval, take } from 'rxjs';
// eslint-disable-next-line import/no-webpack-loader-syntax
import s3Logo from '!file-loader!../../assets/icons/aws/s3.svg';
import { serverlessAnimationMachine } from './serverlessAnimationMachine';

hljs.registerLanguage('typescript', typescript);

const serverlessCss = css`
  display: flex;
  height: calc(100vh - 75px);
  align-content: flex-start;
  pre, canvas {
    flex: 0 0 100%;
    flex-wrap: wrap;
  }
  pre {
    height: 220px;
    overflow-y: auto;
    max-height: 300px;
    font-size: 12px;
    font-family: "zeitung-mono";
  }
  canvas {
    max-width: 375px;
  }
  @media(min-width: 1200px) {
    height: auto;
    pre, canvas {
      flex: 0 0 50%;
    }
    pre {
      height: 350px;
      background-color: #fff;
    }
  }
`;

const commands = [{
  type: 'TYPE',
  text: `
  import React from 'react';`,
}, {
  type: 'TYPE',
  text: `
  // create S3 Bucket that will host our frontend`,
}, {
  type: 'TYPE',
  text: `
  const MyButton: FC = ({ children }) => (
    <button type="button">{ children }</button>
  );`,
}, {
  type: 'TYPE',
  text: `
  const MyButton: FC = ({ children }) => (
    <button type="button">{ children }</button>
  );`,
}, {
  type: 'TYPE',
  text: `
  const MyButton: FC = ({ children }) => (
    <button type="button">{ children }</button>
  );`,
}, {
  type: 'TYPE',
  text: `
  const MyButton: FC = ({ children }) => (
    <button type="button">{ children }</button>
  );`,
}, {
  type: 'DRAW',
  logo: s3Logo,
}, {
  type: 'TYPE',
  text: `
  const MyButton: FC = ({ children }) => (
    <button type="button">{ children }</button>
  );`,
}];

export const Serverless: VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeRef = useRef<HTMLElement>(null);

  const [_, send] = useMachine(serverlessAnimationMachine.withConfig({
    services: {
      typeLine: (context, event: {element: HTMLElement, text: string}) => new Promise<void>((resolve) => {
        const { element, text } = event;
        const rows = text.split('\n');
        interval(50).pipe(take(rows.length)).subscribe((rowNumber) => {
          element.append(`${rows[rowNumber]}\n`);
          hljs.highlightElement(element);
          element.parentElement?.scroll({
            behavior: 'smooth',
            top: element.scrollHeight,
          });
        });
        resolve();
      }),
      draw: (context, event) => new Promise<void>((resolve) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          const logo = new Image();
          logo.onload = () => {
            ctx.drawImage(logo, 375 / 2 - 24, 300 / 2 - 24, 48, 48);
          };
          logo.src = event.logo;
        }
        resolve();
      }),
    },
  }), { devTools: true });

  useEffect(() => {
    const typeIntervals = interval(250).pipe(
      take(commands.length),
    );
    typeIntervals.subscribe((x) => {
      if (codeRef.current && canvasRef.current) {
        const command = commands[x];
        send({ element: codeRef.current, ...command });
      }
    });
  }, [send, codeRef]);

  return (
    <figure className="serverless" css={serverlessCss}>
      <canvas ref={canvasRef} width="375" height="300" />
      <pre>
        <code className="language-typescript" ref={codeRef} />
      </pre>
    </figure>
  );
};
