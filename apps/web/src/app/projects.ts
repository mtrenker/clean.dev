export interface Project {
  id: string;
  industry?: {
    en: string;
    de: string;
  };
  company?: string;
  title: {
    en: string;
    de: string;
  };
  description: {
    en: string;
    de: string;
  };
  city: string;
  highlights: {
    en: string[];
    de: string[];
  };
  technologies: string[];
  startDate: string;
  endDate: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: '1',
    company: 'Siemens AG',
    industry: {
      en: 'Engineering',
      de: 'Ingenieurswesen',
    },
    title: {
      en: 'Web Developer',
      de: 'Webentwickler',
    },
    description: {
      en: 'Developing and maintaining Sites in a SharePoint environment.',
      de: 'Entwicklung und Pflege von Websites in einer SharePoint-Umgebung.',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'sharepoint',
      'javascript',
      'html',
      'css',
      'google-maps'
    ],
    startDate: '2008-11',
    endDate: '2009-02',
    featured: true,
  },
  {
    id: '2',
    company: 'McKinsey & Company',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Fullstack Developer',
      de: 'Fullstack-Entwickler',
    },
    description: {
      en: 'Developing and maintenance of an asset management system based on PHP, ExtJS, Oracle DB in an Agile team.',
      de: 'Entwicklung und Wartung eines Asset-Management-Systems auf Basis von PHP, ExtJS, Oracle DB in einem agilen Team.',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'extjs',
      'oracle',
      'php',
      'javascript',
      'html',
      'css',
      'zend-framework'
    ],
    startDate: '2009-02',
    endDate: '2012-07',
    featured: true,
  },
  {
    id: '3',
    company: 'Travian Games',
    industry: {
      en: 'Gaming',
      de: 'Spieleentwicklung',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developing the JavaScript components for Web based Browser game with MooTools',
      de: 'Entwicklung von JavaScript-Komponenten für webbasierte Browserspiele mit MooTools',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'mootools',
      'javascript',
      'html',
      'css',
    ],
    startDate: '2010-12',
    endDate: '2011-10',
    featured: true,
  },
  {
    id: '4',
    company: 'Mindogo GmbH',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Web Developer',
      de: 'Webentwickler',
    },
    description: {
      en: 'Development and maintenance of a web based auction tool for an office wide, yearly charity auction based on Laravel 3, AngularJS and MySQL',
      de: 'Entwicklung und Wartung eines webbasierten Auktionswerkzeugs für eine büroweite, jährliche Wohltätigkeitsauktion basierend auf Laravel 3, AngularJS und MySQL',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'laravel',
      'angularjs',
      'mysql',
      'javascript',
      'html',
      'css',
      'php'
    ],
    startDate: '2012-07',
    endDate: '2016-01',
    featured: true,
  },
  {
    id: '5',
    company: 'McKinsey & Company',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Web Developer',
      de: 'Webentwickler',
    },
    description: {
      en: 'Development and maintenance of a world-wide Hardware-Migration-Management system for a leading Consulting Company using Zend Framework 1, Oracle DB and custom JavaScript',
      de: 'Entwicklung und Wartung eines weltweiten Hardware-Migrations-Managementsystems für ein führendes Beratungsunternehmen mit Zend Framework 1, Oracle DB und individuellem JavaScript',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'zend-framework',
      'oracle',
      'javascript',
      'html',
      'css',
      'php'
    ],
    startDate: '2012-08',
    endDate: '2014-10',
    featured: true,
  },
  {
    id: '6',
    company: 'BMW Group',
    industry: {
      en: 'Automotive',
      de: 'Automobilindustrie',
    },
    title: {
      en: 'Fullstack Developer',
      de: 'Fullstack-Entwickler',
    },
    description: {
      en: 'Creating a web-based survey system for global and local evaluation of car dealerships with PHP, Oracle DB, Laravel, AngularJS',
      de: 'Erstellung eines webbasierten Umfragesystems zur globalen und lokalen Bewertung von Autohändlern mit PHP, Oracle DB, Laravel, AngularJS',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'laravel',
      'angularjs',
      'mysql',
      'javascript',
      'html',
      'css',
      'php'
    ],
    startDate: '2013-01',
    endDate: '2013-07',
    featured: true,
  },
  {
    id: '7',
    company: 'McKinsey & Company',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Fullstack Developer / Lead',
      de: 'Fullstack-Entwickler / Leiter',
    },
    description: {
      en: 'Architected and developed a hardware migration management application with PHP, Oracle DB, Symfony, React',
      de: 'Architektur und Entwicklung einer Hardware-Migrationsmanagementanwendung mit PHP, Oracle DB, Symfony, React',
    },
    city: 'Munich',
    highlights: {
      en: ['CQRS based data-structures'],
      de: ['CQRS-basierte Datenstrukturen'],
    },
    technologies: [
      'symfony',
      'react',
      'cqrs',
      'mysql',
      'javascript',
      'html',
      'css',
      'php'
    ],
    startDate: '2014-09',
    endDate: '2016-06',
    featured: true,
  },
  {
    id: '8',
    company: 'Mindogo GmbH',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Fullstack Developer / Lead',
      de: 'Fullstack-Entwickler / Leiter',
    },
    description: {
      en: 'Development of a Web-Based Personnel and Guest Badge Management Tool',
      de: 'Entwicklung eines webbasierten Tools zur Verwaltung von Personal- und Gästeausweisen',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'laravel',
      'angularjs',
      'mysql',
      'javascript',
      'html',
      'css',
      'php',
      'printing',
      'qr-codes'
    ],
    startDate: '2016-04',
    endDate: '2016-07',
    featured: true,
  },
  {
    id: '9',
    company: 'F24 AG',
    title: {
      en: 'Lead Developer',
      de: 'Leitender Entwickler',
    },
    description: {
      en: 'Migrating Apple App to Android using React and Cordova',
      de: 'Migration einer Apple-App auf Android mit React und Cordova',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'react',
      'cordova',
    ],
    startDate: '2016-08',
    endDate: '2016-10',
    featured: true,
  },
  {
    id: '10',
    company: 'Brückner Group',
    industry: {
      en: 'Machine Manufacturing',
      de: 'Maschinenbau',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developed dashboard components for web-based monitoring applications directly the machines',
      de: 'Entwicklung von Dashboard-Komponenten für webbasierte Überwachungsanwendungen direkt an den Maschinen',
    },
    city: 'Siegsdorf',
    highlights: {
      en: ['native web components via Polymer'],
      de: ['native Webkomponenten über Polymer'],
    },
    technologies: [
      'polymer',
      'web-components',
    ],
    startDate: '2016-11',
    endDate: '2017-11',
    featured: true,
  },
  {
    id: '11',
    company: 'Lufthansa AG',
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developing react components for usage in Adobe Experience Manager',
      de: 'Entwicklung von React-Komponenten für die Verwendung im Adobe Experience Manager',
    },
    city: 'Hamburg',
    highlights: {
      en: [
        'heavy focus on accessibility',
        'modular architecture'
      ],
      de: [
        'starker Fokus auf Barrierefreiheit',
        'modulare Architektur'
      ],
    },
    technologies: [
      'react',
      'aem',
      'typescript',
      'redux',
      'storybook',
      'jest'
    ],
    startDate: '2017-11',
    endDate: '2018-05',
    featured: true,
  },
  {
    id: '12',
    company: 'Fineway AG',
    industry: {
      en: 'Travel',
      de: 'Reisen',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developed and maintained components for an online travel magazine with React, TypeScript, GraphQL',
      de: 'Entwicklung und Wartung von Komponenten für ein Online-Reisemagazin mit React, TypeScript, GraphQL',
    },
    city: 'Munich',
    highlights: {
      en: ['used contentful as headless CMS'],
      de: ['Verwendung von Contentful als Headless-CMS'],
    },
    technologies: [
      'typescript',
      'react',
      'graphql',
      'headless-cms',
      'storybook',
      'jest',
    ],
    startDate: '2018-08',
    endDate: '2018-12',
    featured: true,
  },
  {
    id: '13',
    company: 'InstaMotion Retail GmbH',
    industry: {
      en: 'Retail',
      de: 'Einzelhandel',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developed a web magazine connected to a headless CMS with React, GraphQL',
      de: 'Entwicklung eines Webmagazins, verbunden mit einem Headless-CMS, mit React, GraphQL',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'react',
      'headless-cms',
      'storybook',
      'jest',
    ],
    startDate: '2019-04',
    endDate: '2019-07',
    featured: true,
  },
  {
    id: '14',
    company: 'ProSiebenSat.1 Digital GmbH',
    industry: {
      en: 'Media',
      de: 'Medien',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developed and maintained react components for popular TV formats with React, GraphQL, tracking',
      de: 'Entwicklung und Wartung von React-Komponenten für beliebte TV-Formate mit React, GraphQL, Tracking',
    },
    city: 'Munich',
    highlights: {
      en: [],
      de: [],
    },
    technologies: [
      'react',
      'graphql',
      'jest',
      'cypress',
      'storybook',
      'apollo'
    ],
    startDate: '2019-07',
    endDate: '2019-12',
    featured: true,
  },
  {
    id: '15',
    company: 'Interhyp AG',
    industry: {
      en: 'Finance',
      de: 'Finanzen',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Developed components for a communication micro-frontend with React, Redux-Toolkit, VoIP',
      de: 'Entwicklung von Komponenten für ein Kommunikations-Micro-Frontend mit React, Redux-Toolkit, VoIP',
    },
    city: 'Munich',
    highlights: {
      en: [
        'supported the team as an agile coach',
        'positive first WebRTC experience'
      ],
      de: [
        'Unterstützung des Teams als agiler Coach',
        'erste positive Erfahrungen mit WebRTC'
      ],
    },
    technologies: [
      'react',
      'redux-toolkit',
      'webrtc',
      'jest',
      'storybook',
      'react testing library',
    ],
    startDate: '2020-07',
    endDate: '2021-03',
    featured: true,
  },
  {
    id: '16',
    company: 'Fielmann AG',
    industry: {
      en: 'Retail',
      de: 'Einzelhandel',
    },
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Refactored an AngularJS-based server-data/form-data heavy application to a react-based app with TypeScript, XState, React Hook Form',
      de: 'Refaktorierung einer AngularJS-basierten Anwendung mit schwerem Server-/Formulardaten-Aufkommen zu einer React-basierten App mit TypeScript, XState, React Hook Form',
    },
    city: 'Munich',
    highlights: {
      en: [
        'heavily leaned into pair-programming to ensure the best knowledge transfer',
        'designed and developed state-machine driven, extensible multi-form architecture',
        'developed custom onscreen keyboards for optimal workflow'
      ],
      de: [
        'intensive Nutzung von Pair-Programming für optimalen Wissenstransfer',
        'Entwurf und Entwicklung einer durch Zustandsmaschinen angetriebenen, erweiterbaren Multi-Form-Architektur',
        'Entwicklung kundenspezifischer Bildschirmtastaturen für optimalen Workflow'
      ],
    },
    technologies: [
      'react',
      'typescript',
      'xstate',
      'storybook',
      'cypress',
    ],
    startDate: '2021-03',
    endDate: '2021-12',
    featured: true,
  },
  {
    id: '17',
    company: 'UXMA GmbH & Co. KG',
    title: {
      en: 'Frontend Developer',
      de: 'Frontend-Entwickler',
    },
    description: {
      en: 'Led a team of 3 developers building a server-data-heavy web app written with TypeScript, React, Redux Toolkit, TanStack Table, React MUI',
      de: 'Leitung eines Teams von 3 Entwicklern beim Bau einer serverdatenintensiven Web-App, geschrieben mit TypeScript, React, Redux Toolkit, TanStack Table, React MUI',
    },
    city: 'Munich',
    highlights: {
      en: [
        'constant pair-programming with two juniors for quick and effective knowledge transfer',
        'significantly improved performance by eliminating bottlenecks in render cycles'
      ],
      de: [
        'ständiges Pair-Programming mit zwei Junioren für schnellen und effektiven Wissenstransfer',
        'deutliche Leistungssteigerung durch Beseitigung von Engpässen in Renderzyklen'
      ],
    },
    technologies: [
      'react',
      'typescript',
      'redux-toolkit',
      'jest',
      'react-testing-library',
      'storybook',
      'cypress',
    ],
    startDate: '2022-01',
    endDate: '2022-07',
    featured: true,
  },
  {
    id: '18',
    company: 'Oetker Digital GmbH',
    title: {
      en: 'Solutions Architect',
      de: 'Lösungsarchitekt',
    },
    description: {
      en: 'Evaluated and managed the handover of a web project from an external agency to an newly formed internal team',
      de: 'Bewertung und Management der Übergabe eines Webprojekts von einer externen Agentur an ein neu gebildetes internes Team',
    },
    city: 'Berlin',
    highlights: {
      en: [
        'reviewed and improved best practices for next.js, TypeScript, React, GraphQL, Apollo, Cypress, Storybook, tailwindcss',
        'coordinated the merge of two web-projects into one',
        'onboarded new hires and helped them to get up to speed',
        'supported the team with agile practices'
      ],
      de: [
        'Überprüfung und Verbesserung der Best Practices für next.js, TypeScript, React, GraphQL, Apollo, Cypress, Storybook, TailwindCSS',
        'Koordination der Zusammenführung von zwei Webprojekten zu einem',
        'Einarbeitung neuer Mitarbeiter und Unterstützung bei der Eingewöhnung',
        'Unterstützung des Teams mit agilen Praktiken'
      ],
    },
    technologies: [
      'react',
      'next.js',
      'typescript',
      'graphql',
      'apollo',
      'cypress',
      'storybook',
      'tailwindcss',
    ],
    startDate: '2022-09',
    endDate: '2023-05',
    featured: true,
  },
];
