import { css } from '@emotion/react';

export const globalCssVariables = css`
  --brand-hue: 220;
  --brand-saturation: 45%;
  --brand-lightness: 61%;
`;

export const lightCssVariables = css`
  --brand-light: hsl(
    var(--brand-hue)
    var(--brand-saturation)
    var(--brand-lightness)
  );

  --text1-light: #1F2A33;
  --text2-light: #5C758A;
  --text3-light: #FFFFFF;

  --surface1-light: #FFFFFF;
  --surface2-light: #EAF4FC;
  --surface3-light: #9DBDD4;
  --surface4-light: #5C758A;
  --surface5-light: #1F2A33;

  --surface-shadow-light: var(--brand-hue) 10% 20%;
  --shadow-strength-light: .02;

  --border-light: 1px solid hsl(var(--brand-hue) 10% 50% / 15%);

  --box-shadow-light:
    0 2.8px 2.2px hsl(var(--surface-shadow-light) / calc(var(--shadow-strength-light) + .03)),
    0 6.7px 5.3px hsl(var(--surface-shadow-light) / calc(var(--shadow-strength-light) + .01)),
    0 12.5px 10px hsl(var(--surface-shadow-light) / calc(var(--shadow-strength-light) + .02)),
    0 22.3px 17.9px hsl(var(--surface-shadow-light) / calc(var(--shadow-strength-light) + .02)),
    0 41.8px 33.4px hsl(var(--surface-shadow-light) / calc(var(--shadow-strength-light) + .03)),
    0 100px 80px hsl(var(--surface-shadow-light) / var(--shadow-strength-light))
  ;
`;

export const darkCssVariables = css`
  --brand-dark: hsl(
    var(--brand-hue)
    calc(var(--brand-saturation) / 2)
    calc(var(--brand-lightness) / 1.5)
  );

  --text1-dark: hsl(var(--brand-hue) 15% 90%);
  --text2-dark: hsl(var(--brand-hue) 30% 30%);

  --surface1-dark: #122629;
  --surface2-dark: #003B42;
  --surface3-dark: #2D4246;

  --surface-shadow-dark: var(--brand-hue) 10% 20%;
  --shadow-strength-dark: .02;

  --border-dark: 1px solid hsl(var(--brand-hue) 10% 50% / 15%);

  --box-shadow-dark:
    0 2.8px 2.2px hsl(var(--surface-shadow-dark) / calc(var(--shadow-strength-dark) + .03)),
    0 6.7px 5.3px hsl(var(--surface-shadow-dark) / calc(var(--shadow-strength-dark) + .01)),
    0 12.5px 10px hsl(var(--surface-shadow-dark) / calc(var(--shadow-strength-dark) + .02)),
    0 22.3px 17.9px hsl(var(--surface-shadow-dark) / calc(var(--shadow-strength-dark) + .02)),
    0 41.8px 33.4px hsl(var(--surface-shadow-dark) / calc(var(--shadow-strength-dark) + .03)),
    0 100px 80px hsl(var(--surface-shadow-dark) / var(--shadow-strength-dark))
  ;
`;
