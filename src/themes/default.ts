type Pixel = number;
type Border = string;
type Color = string;

// interface Colormap {
//   contrast30: string;
//   contrast60: string;
//   contrast80: string;
//   contrast: string;
//   attention30: string;
//   attention60: string;
//   attention80: string;
//   attention: string;
//   primary30: string;
//   primary60: string;
//   primary80: string;
//   primary: string;
//   secondary30: string;
//   secondary60: string;
//   secondary80: string;
//   secondary: string;
//   background30: string;
//   background60: string;
//   background80: string;
//   background: string;
//   [key: string]: string;
// }

// export const palette: Color[] = [{
//   title: 'Contrast',
//   subtitle: 'Raisin Black',
//   rgb: [35, 31, 32],
// }, {
//   title: 'Attention',
//   subtitle: 'International Orange Golden Gate Bridge',
//   rgb: [187, 68, 48],
// }, {
//   title: 'Primary',
//   subtitle: 'Middle Blue',
//   rgb: [126, 189, 194],
// }, {
//   title: 'Secondary',
//   subtitle: 'Medium Champagne',
//   rgb: [243, 223, 162],
// }, {
//   title: 'Background',
//   subtitle: 'Linen',
//   rgb: [239, 230, 221],
// }];

// const colorsGenerator = (colors: Color[]): Colormap => {
//   const map: Partial<Colormap> = {};
//   const steps = [30, 60, 80, 100];
//   colors.forEach((color) => {
//     steps.forEach((step) => {
//       const suffix = step < 100 ? `${step}` : '';
//       const alpha = step < 100 ? `.${step}` : 1;
//       const title = color.title.toLowerCase();
//       map[`${title}${suffix}`] = `rgba(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${alpha})`;
//     });
//   });
//   return map as Colormap;
// };

interface Button {
  color: Color;
  backgrounbd: Color;
  border: Border;
}

export interface Theme {
  card: {
    border: {
      radius: number;
      color: string;
    }
  }
}

export const breakPoints = {
  mobile: '576px',
  tablet: '768px',
  desktop: '992px',
  large: '1200px',
};

export const theme: Theme = {
  card: {
    border: {
      color: '#000000',
      radius: 4,
    },
  },
};
