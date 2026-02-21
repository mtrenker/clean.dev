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
  spotlight?: boolean;
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
      en: 'Built and maintained internal web portals for one of Germany\'s largest engineering firms within a SharePoint environment.',
      de: 'Aufbau und Pflege interner Webportale für eines der größten deutschen Industrieunternehmen in einer SharePoint-Umgebung.',
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
      en: 'Extended and maintained a global asset management system for McKinsey\'s IT operations, built on PHP, ExtJS and Oracle DB within a cross-functional agile team.',
      de: 'Erweiterung und Wartung eines globalen Asset-Management-Systems für den IT-Betrieb von McKinsey, gebaut auf PHP, ExtJS und Oracle DB in einem cross-funktionalen agilen Team.',
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
      en: 'Built interactive JS components for a live browser game, with a tight focus on performance and smooth real-time UX.',
      de: 'Entwicklung interaktiver JavaScript-Komponenten für ein live Browserspiel mit starkem Fokus auf Performance und flüssige Echtzeit-UX.',
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
      en: 'Fullstack Developer',
      de: 'Fullstack-Entwickler',
    },
    description: {
      en: 'Owned a full-stack auction platform used for a company-wide annual charity event — from database schema to frontend, soup to nuts.',
      de: 'Vollständige Eigenverantwortung für eine Full-Stack-Auktionsplattform für die jährliche firmenweite Wohltätigkeitsveranstaltung – von der Datenbankstruktur bis zum Frontend.',
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
      en: 'Fullstack Developer',
      de: 'Fullstack-Entwickler',
    },
    description: {
      en: 'Maintained a worldwide hardware migration tracking system used across McKinsey offices globally, built on Zend Framework and Oracle DB.',
      de: 'Wartung eines weltweit genutzten Hardware-Migrations-Trackingsystems für McKinsey-Büros, gebaut auf Zend Framework und Oracle DB.',
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
      en: 'Built a multi-region dealer evaluation platform for BMW, supporting both customer-facing and internal staff surveys across global markets.',
      de: 'Entwicklung einer regionenübergreifenden Händlerbewertungsplattform für BMW mit Unterstützung von Kunden- und internen Mitarbeiterumfragen in globalen Märkten.',
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
    spotlight: true,
  },
  {
    id: '7',
    company: 'McKinsey & Company',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Technical Lead',
      de: 'Technischer Leiter',
    },
    description: {
      en: 'Rearchitected a legacy migration tool from scratch — moved to Symfony + React with CQRS-backed data structures, significantly improving maintainability and auditability.',
      de: 'Neuarchitektur eines Legacy-Migrationstools von Grund auf – Migration zu Symfony + React mit CQRS-basierten Datenstrukturen für deutlich bessere Wartbarkeit und Nachvollziehbarkeit.',
    },
    city: 'Munich',
    highlights: {
      en: ['introduced CQRS — a rare pattern in PHP shops at the time'],
      de: ['Einführung von CQRS – damals ein seltenes Muster in PHP-Projekten'],
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
    spotlight: true,
  },
  {
    id: '8',
    company: 'Mindogo GmbH',
    industry: {
      en: 'Consulting',
      de: 'Beratung',
    },
    title: {
      en: 'Technical Lead',
      de: 'Technischer Leiter',
    },
    description: {
      en: 'Delivered a QR-code-based badge management system for staff and visitors, including on-demand print integration.',
      de: 'Entwicklung eines QR-Code-basierten Ausweismanagementsystems für Mitarbeiter und Gäste, inklusive On-Demand-Druckintegration.',
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
      en: 'Ported an iOS app to Android using React and Cordova. Scoped, executed and shipped within two months.',
      de: 'Portierung einer iOS-App auf Android mit React und Cordova. Konzipiert, umgesetzt und in zwei Monaten ausgeliefert.',
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
      en: 'Frontend Engineer',
      de: 'Frontend-Ingenieur',
    },
    description: {
      en: 'Built real-time monitoring dashboards served directly on industrial machines, using native web components years before they went mainstream.',
      de: 'Entwicklung von Echtzeit-Monitoring-Dashboards direkt auf Industriemaschinen, mit nativen Webkomponenten – Jahre bevor diese zum Standard wurden.',
    },
    city: 'Siegsdorf',
    highlights: {
      en: ['early adopter of native web components via Polymer in a production manufacturing context'],
      de: ['früher Einsatz nativer Webkomponenten via Polymer in einer produktiven Fertigungsumgebung'],
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
      en: 'Frontend Engineer',
      de: 'Frontend-Ingenieur',
    },
    description: {
      en: 'Developed React components for Lufthansa\'s digital touchpoints, integrated into Adobe Experience Manager.',
      de: 'Entwicklung von React-Komponenten für die digitalen Touchpoints von Lufthansa, integriert in Adobe Experience Manager.',
    },
    city: 'Hamburg',
    highlights: {
      en: [
        'accessibility as a hard requirement, not an afterthought',
        'component library built for editorial reuse across markets'
      ],
      de: [
        'Barrierefreiheit als feste Anforderung, nicht als Nachgedanke',
        'Komponentenbibliothek für redaktionelle Wiederverwendung über mehrere Märkte'
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
    spotlight: true,
  },
  {
    id: '12',
    company: 'Fineway AG',
    industry: {
      en: 'Travel',
      de: 'Reisen',
    },
    title: {
      en: 'Frontend Engineer',
      de: 'Frontend-Ingenieur',
    },
    description: {
      en: 'Built components for an online travel magazine using React, TypeScript and GraphQL, backed by Contentful as a headless CMS.',
      de: 'Entwicklung von Komponenten für ein Online-Reisemagazin mit React, TypeScript und GraphQL, unterstützt durch Contentful als Headless-CMS.',
    },
    city: 'Munich',
    highlights: {
      en: ['adopted Contentful as headless CMS before the pattern became industry standard'],
      de: ['Einsatz von Contentful als Headless-CMS, bevor das Muster zum Branchenstandard wurde'],
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
      en: 'Frontend Engineer',
      de: 'Frontend-Ingenieur',
    },
    description: {
      en: 'Built a React + GraphQL web magazine for Germany\'s largest online car dealer, connected to a headless CMS.',
      de: 'Entwicklung eines React- und GraphQL-basierten Webmagazins für Deutschlands größten Online-Autohändler, verbunden mit einem Headless-CMS.',
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
      en: 'Frontend Engineer',
      de: 'Frontend-Ingenieur',
    },
    description: {
      en: 'Built and maintained React components powering high-traffic show websites for ProSieben and Sat.1 formats, with GraphQL APIs and analytics tracking throughout.',
      de: 'Entwicklung und Wartung von React-Komponenten für stark frequentierte Show-Websites von ProSieben und Sat.1, mit GraphQL-APIs und durchgängigem Analytics-Tracking.',
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
    spotlight: true,
  },
  {
    id: '15',
    company: 'Interhyp AG',
    industry: {
      en: 'Finance',
      de: 'Finanzen',
    },
    title: {
      en: 'Engineering Consultant',
      de: 'Engineering-Berater',
    },
    description: {
      en: 'Built a real-time communication micro-frontend handling VoIP calls between customers and mortgage advisors, using React, Redux Toolkit and WebRTC.',
      de: 'Entwicklung eines Echtzeit-Kommunikations-Micro-Frontends für VoIP-Gespräche zwischen Kunden und Hypothekenberatern, mit React, Redux Toolkit und WebRTC.',
    },
    city: 'Munich',
    highlights: {
      en: [
        'doubled as agile coach, introducing practices that noticeably reduced sprint friction',
        'first production WebRTC integration — shipped without third-party SDK'
      ],
      de: [
        'zusätzliche Rolle als Agile Coach mit messbarer Reduktion von Sprint-Reibung',
        'erste produktive WebRTC-Integration – ohne Drittanbieter-SDK ausgeliefert'
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
    spotlight: true,
  },
  {
    id: '16',
    company: 'Fielmann AG',
    industry: {
      en: 'Retail',
      de: 'Einzelhandel',
    },
    title: {
      en: 'Frontend Architect',
      de: 'Frontend-Architekt',
    },
    description: {
      en: 'Rewrote a complex AngularJS optometry workflow app in TypeScript/React, replacing ad-hoc state logic with XState-driven form architecture for in-store staff.',
      de: 'Neuentwicklung einer komplexen AngularJS-Optometrie-Workflow-App in TypeScript/React – Ad-hoc-Zustandslogik wurde durch eine XState-gesteuerte Formulararchitektur für das Filial-Personal ersetzt.',
    },
    city: 'Munich',
    highlights: {
      en: [
        'daily pair-programming as the main knowledge transfer strategy — worked exceptionally well',
        'state-machine driven multi-step form architecture built for extensibility',
        'custom on-screen keyboards tailored to in-store workflows'
      ],
      de: [
        'tägliches Pair-Programming als zentrale Wissenstransferstrategie – außerordentlich effektiv',
        'zustandsmaschinengesteuerte Multi-Schritt-Formulararchitektur für maximale Erweiterbarkeit',
        'maßgeschneiderte Bildschirmtastaturen für Filial-Workflows'
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
    spotlight: true,
  },
  {
    id: '17',
    company: 'UXMA GmbH & Co. KG',
    title: {
      en: 'Technical Lead',
      de: 'Technischer Leiter',
    },
    description: {
      en: 'Led a three-person team building a data-heavy internal web app in TypeScript and React, with a strong focus on mentoring two junior developers.',
      de: 'Leitung eines dreiköpfigen Teams beim Bau einer datenintensiven internen Web-App in TypeScript und React, mit starkem Fokus auf die Betreuung zweier Junior-Entwickler.',
    },
    city: 'Munich',
    highlights: {
      en: [
        'daily pair-programming with two juniors — both grew into independent contributors within weeks',
        'tracked down and resolved chronic render-cycle bottlenecks, cutting page interaction time noticeably'
      ],
      de: [
        'tägliches Pair-Programming mit zwei Junioren – beide wurden innerhalb weniger Wochen zu selbstständigen Entwicklern',
        'chronische Render-Zyklen-Engpässe identifiziert und beseitigt – spürbar schnellere Seiteninteraktion'
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
      en: 'Managed the handover of a Next.js platform from an external agency to a newly formed in-house team — audited the codebase, merged two products, and got the team up to speed.',
      de: 'Steuerung der Übergabe einer Next.js-Plattform von einer externen Agentur an ein neu gebildetes internes Team – Codebase-Audit, Zusammenführung zweier Produkte und schnelles Onboarding des Teams.',
    },
    city: 'Berlin',
    highlights: {
      en: [
        'audited and raised code quality across the full stack: Next.js, TypeScript, GraphQL, Apollo, Cypress, Storybook, Tailwind',
        'consolidated two separate web products into a single codebase without disrupting active development',
        'onboarded four new hires in parallel while keeping delivery on track',
        'introduced lightweight agile practices that the team still uses'
      ],
      de: [
        'Codequalität über den gesamten Stack verbessert: Next.js, TypeScript, GraphQL, Apollo, Cypress, Storybook, Tailwind',
        'zwei separate Webprodukte ohne Unterbrechung der laufenden Entwicklung zu einer gemeinsamen Codebasis zusammengeführt',
        'vier neue Mitarbeiter parallel eingearbeitet und Lieferung trotzdem im Zeitplan gehalten',
        'schlanke agile Praktiken eingeführt, die das Team noch heute nutzt'
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
    spotlight: true,
  },
  {
    id: '19',
    company: 'Douglas GmbH',
    industry: {
      en: 'Retail',
      de: 'Einzelhandel',
    },
    title: {
      en: 'Consultant & Technical Lead',
      de: 'Berater & Technischer Leiter',
    },
    description: {
      en: 'Engaged as React expert and consultant to modernise the POS software running in ~1,800 Douglas stores across 26 European countries. Led the full rewrite of a complex, hard-to-maintain CRM integration from legacy code to a clean React architecture — shipped in under a year. Also responsible for the customer care app (Angular, maintenance) and greenfield tooling.',
      de: 'Als React-Experte und Berater engagiert, um die POS-Software in ~1.800 Douglas-Filialen in 26 europäischen Ländern zu modernisieren. Vollständige Neuentwicklung einer komplexen, schwer wartbaren CRM-Integration von Legacy-Code auf saubere React-Architektur – in unter einem Jahr ausgeliefert. Verantwortlich auch für die Customer-Care-App (Angular, Wartung) sowie neue Eigenentwicklungen.',
    },
    city: 'Düsseldorf',
    highlights: {
      en: [
        'rewrote the entire CRM/POS integration from scratch in under a year — every aspect improved: architecture, testing, documentation',
        'software runs on every cash register in ~1,800 stores across 26 European countries',
        'shifted from fear-driven 9pm deployments to deploy-any-time by introducing resilience and self-healing patterns',
        'onboarded 1 senior and 2 junior developers; all productive contributors within weeks',
        'introduced "Full Stack Fridays" — team-driven learning sessions covering Figma prototyping, GraphQL/C#/.NET, and more',
        'built an in-house shortlink and QR service in Next.js + .NET in weeks, replacing a third-party SaaS that no longer met business needs',
        'led responsible AI adoption across the team — tooling, practices, and guardrails',
      ],
      de: [
        'vollständige Neuentwicklung der CRM/POS-Integration in unter einem Jahr – Architektur, Tests und Dokumentation durchgängig verbessert',
        'Software läuft auf jedem Kassenterminal in ~1.800 Filialen in 26 europäischen Ländern',
        'von angstgesteuerten Deployments um 21 Uhr zu jederzeit möglichen Deployments durch Resilienz- und Self-Healing-Muster',
        '1 Senior und 2 Junior-Entwickler eingearbeitet – alle innerhalb weniger Wochen produktive Beitragende',
        '"Full Stack Fridays" eingeführt – teamgetriebene Lernsessions zu Figma, GraphQL/C#/.NET und mehr',
        'Inhouse-Shortlink- und QR-Service in Next.js + .NET in wenigen Wochen von Anfrage bis Produktion gebaut – als SaaS-Ersatz',
        'verantwortungsvolle KI-Nutzung im Team eingeführt – Tooling, Praktiken und Leitplanken',
      ],
    },
    technologies: [
      'react',
      'typescript',
      'next.js',
      'dotnet',
      'csharp',
      'mongodb',
      'kubernetes',
      'azure-devops',
      'entra-id',
      'instana',
      'grafana',
    ],
    startDate: '2024-01',
    endDate: '2026-02',
    featured: true,
    spotlight: true,
  }
];
