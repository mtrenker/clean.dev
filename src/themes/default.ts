export interface Theme {
  colors: {
    [color: string]: string;
  };
}

interface Color {
  title: string;
  subtitle: string;
  rgb: number[];
}

interface Colormap {
  [category: string]: {
    [name: string]: string;
  }
}

export const palette: Color[] = [{
  title: 'Contrast',
  subtitle: 'Raisin Black',
  rgb: [35, 31, 32],
}, {
  title: 'Attention',
  subtitle: 'International Orange Golden Gate Bridge',
  rgb: [187, 68, 48],
}, {
  title: 'Primary',
  subtitle: 'Middle Blue',
  rgb: [126, 189, 194],
}, {
  title: 'Secondary',
  subtitle: 'Medium Champagne',
  rgb: [243, 223, 162],
}, {
  title: 'Background',
  subtitle: 'Linen',
  rgb: [239, 230, 221],
}];

const colorsGenerator = (colors: Color[]): Colormap => {
  const map: Colormap = {
    primary: {},
    secondary: {},
    attention: {},
    contrast: {},
    background: {},
  };
  const steps = [30, 60, 80, 100];
  colors.forEach((color) => {
    steps.forEach((step) => {
      const suffix = step < 100 ? `${step}` : '';
      const alpha = step < 100 ? `.${step}` : 1;
      const title = color.title.toLowerCase();
      map[title][`${title}${suffix}`] = `rgba(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${alpha})`;
    });
  });
  return map;
};

export const breakPoints = {
  mobile: '576px',
  tablet: '768px',
  desktop: '992px',
  large: '1200px',
};

export const theme = {
  colors: colorsGenerator(palette),
};
