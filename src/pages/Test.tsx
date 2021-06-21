import { ChangeEvent, VFC } from 'react';
import { css } from '@emotion/react';

import { Header } from '../components/Header';

const testCss = css`
  h1, p {
    color: var(--text1);
  }
  button {
    &.primary {
      background-color: var(--brand);
      color: var(--text1);
    }
  }
  p {
    max-width: 120ch;
  }
  .surfaces {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px;
    div {
      height: 300px;
      box-shadow: var(--box-shadow);
      border: var(--border);
      border-radius: 15px;
      padding: 24px;
    }
    div:nth-child(1) {
      color: var(--text1);
      background-color: var(--surface1);
    }
    div:nth-child(2) {
      color: var(--text2);
      background-color: var(--surface2);
    }
    div:nth-child(3) {
      color: var(--text1);
      background-color: var(--surface3);
    }
    div:nth-child(4) {
      color: var(--text2);
      background-color: var(--surface4);
    }
  }
`;

const onHueChange = (e: ChangeEvent<HTMLInputElement>) => {
  document.querySelector('html')?.style.setProperty('--brand-hue', e.currentTarget.value);
};
const onSaturationChange = (e: ChangeEvent<HTMLInputElement>) => {
  document.querySelector('html')?.style.setProperty('--brand-saturation', `${e.currentTarget.value}%`);
};
const onLightnessChange = (e: ChangeEvent<HTMLInputElement>) => {
  document.querySelector('html')?.style.setProperty('--brand-lightness', `${e.currentTarget.value}%`);
};

export const Test: VFC = () => (
  <div css={testCss}>
    <Header />
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit.
      Consectetur, harum tempora dolore ab repudiandae, numquam ullam necessitatibus maxime quos iste veritatis?
      Et debitis in suscipit quisquam, eligendi impedit odit delectus.
    </p>
    <p>
      <input type="range" min="0" max="360" onChange={onHueChange} />
      <input type="range" min="0" max="100" onChange={onSaturationChange} />
      <input type="range" min="0" max="100" onChange={onLightnessChange} />
    </p>
    <button type="button" className="primary">Click me</button>
    <button type="button">Nope</button>
    <div className="surfaces">
      <div>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Consectetur, harum tempora dolore ab repudiandae, numquam ullam necessitatibus maxime quos iste veritatis?
          Et debitis in suscipit quisquam, eligendi impedit odit delectus.
        </p>
        <button type="button" className="primary">Click Me</button>
      </div>
      <div>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Consectetur, harum tempora dolore ab repudiandae, numquam ullam necessitatibus maxime quos iste veritatis?
          Et debitis in suscipit quisquam, eligendi impedit odit delectus.
        </p>
        <button type="button" className="primary">Click Me</button>
      </div>
      <div>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Consectetur, harum tempora dolore ab repudiandae, numquam ullam necessitatibus maxime quos iste veritatis?
          Et debitis in suscipit quisquam, eligendi impedit odit delectus.
        </p>
        <button type="button" className="primary">Click Me</button>
      </div>
      <div>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Consectetur, harum tempora dolore ab repudiandae, numquam ullam necessitatibus maxime quos iste veritatis?
          Et debitis in suscipit quisquam, eligendi impedit odit delectus.
        </p>
        <button type="button" className="primary">Click Me</button>
      </div>
    </div>
  </div>
);
