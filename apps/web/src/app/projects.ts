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
      en: 'Owned a full-stack auction platform used for a company-wide annual charity event, covering database schema, backend, and frontend.',
      de: 'Vollständige Eigenverantwortung für eine Full-Stack-Auktionsplattform für die jährliche firmenweite Wohltätigkeitsveranstaltung, von der Datenbankstruktur bis zum Frontend.',
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
      en: [
        'hierarchical evaluation model: store → local → regional → country, each level saw exactly the data their role required',
        'adopted AngularJS before the framework was mainstream in enterprise contexts',
        'multi-region, multi-language rollout across BMW\'s global dealer network',
      ],
      de: [
        'hierarchisches Bewertungsmodell: Filiale → lokal → regional → Land, jede Ebene sah exakt die Daten, die ihrer Rolle entsprachen',
        'AngularJS eingesetzt, bevor das Framework in Unternehmensumgebungen verbreitet war',
        'mehrsprachiger Rollout über das globale BMW-Händlernetz',
      ],
    },
    technologies: [
      'laravel',
      'angularjs',
      'mysql',
      'javascript',
      'html',
      'css',
      'php',
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
      en: 'Rearchitected a legacy migration tool, moved to Symfony + React with CQRS-backed data structures, and made changes easier to trace and review.',
      de: 'Neuarchitektur eines Legacy-Migrationstools, Migration zu Symfony + React mit CQRS-basierten Datenstrukturen. Änderungen wurden leichter nachvollziehbar und prüfbar.',
    },
    city: 'Munich',
    highlights: {
      en: ['introduced CQRS in a PHP project at a time when the pattern was still uncommon there'],
      de: ['Einführung von CQRS in einem PHP-Projekt, damals dort noch ein ungewohntes Muster'],
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
  },
  {
    id: '10',
    company: 'Brückner Group',
    industry: {
      en: 'Machine Manufacturing',
      de: 'Maschinenbau',
    },
    title: {
      en: 'Real-time Web Systems Engineer',
      de: 'Web-Systemingenieur für Echtzeit-Anwendungen',
    },
    description: {
      en: 'Built real-time monitoring dashboards served directly on industrial machines, using native web components years before they went mainstream.',
      de: 'Entwicklung von Echtzeit-Monitoring-Dashboards direkt auf Industriemaschinen, mit nativen Webkomponenten, Jahre bevor diese zum Standard wurden.',
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
      en: [],
      de: [],
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
        'took on agile coaching alongside development, reducing sprint friction',
        'first production WebRTC integration, shipped without third-party SDK'
      ],
      de: [
        'zusätzlich als Agile Coach aktiv, spürbar weniger Reibung in den Sprints',
        'erste produktive WebRTC-Integration, ohne Drittanbieter-SDK ausgeliefert'
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
      en: 'Technical Architect',
      de: 'Technischer Architekt',
    },
    description: {
      en: 'Rewrote a complex AngularJS optometry workflow app in TypeScript/React, replacing ad-hoc state logic with XState-driven form architecture for in-store staff.',
      de: 'Neuentwicklung einer komplexen AngularJS-Optometrie-Workflow-App in TypeScript/React, Ad-hoc-Zustandslogik wurde durch eine XState-gesteuerte Formulararchitektur für das Filial-Personal ersetzt.',
    },
    city: 'Munich',
    highlights: {
      en: [
        'daily pair-programming as the main knowledge transfer strategy',
        'state-machine driven multi-step form architecture built to make changes safer',
        'custom on-screen keyboards tailored to in-store workflows'
      ],
      de: [
        'tägliches Pair-Programming als zentrale Wissenstransferstrategie',
        'zustandsmaschinengesteuerte Multi-Schritt-Formulararchitektur für sicherere Änderungen',
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
        'daily pair-programming with two juniors, both grew into independent contributors within weeks',
        'tracked down and resolved chronic render-cycle bottlenecks, reducing page interaction delays'
      ],
      de: [
        'tägliches Pair-Programming mit zwei Junioren, beide wurden innerhalb weniger Wochen zu selbstständigen Entwicklern',
        'chronische Render-Zyklen-Engpässe identifiziert und beseitigt, Seiteninteraktionen reagierten schneller'
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
      en: 'Managed the handover of a Next.js platform from an external agency to a newly formed in-house team, audited the codebase, merged two products, and got the team up to speed.',
      de: 'Steuerung der Übergabe einer Next.js-Plattform von einer externen Agentur an ein neu gebildetes internes Team, Codebase-Audit, Zusammenführung zweier Produkte und schnelles Onboarding des Teams.',
    },
    city: 'Berlin',
    highlights: {
      en: [
        'audited the codebase and improved quality across the stack: Next.js, TypeScript, GraphQL, Apollo, Cypress, Storybook, Tailwind',
        'consolidated two separate web products into a single codebase without disrupting active development',
        'onboarded four new hires in parallel while keeping delivery on track',
        'introduced lightweight agile practices that the team adopted'
      ],
      de: [
        'Codebase geprüft und Qualität über den Stack verbessert: Next.js, TypeScript, GraphQL, Apollo, Cypress, Storybook, Tailwind',
        'zwei separate Webprodukte ohne Unterbrechung der laufenden Entwicklung zu einer gemeinsamen Codebasis zusammengeführt',
        'vier neue Mitarbeiter parallel eingearbeitet und Lieferung trotzdem im Zeitplan gehalten',
        'schlanke agile Praktiken eingeführt, die das Team übernommen hat'
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
      en: 'Technical Lead',
      de: 'Technischer Leiter',
    },
    description: {
      en: 'Engaged as React expert to modernise the POS software used in ~1,800 Douglas stores across 26 European countries. Led the transition from a legacy Angular implementation to a maintainable React architecture and shipped the business-critical CRM integration in under a year.',
      de: 'Als React-Experte engagiert, um die POS-Software in ~1.800 Douglas-Filialen in 26 europäischen Ländern zu modernisieren. Leitung der Ablösung einer Legacy-Angular-Implementierung durch eine wartbare React-Architektur – die geschäftskritische CRM-Integration ging in unter einem Jahr live.',
    },
    city: 'Düsseldorf',
    highlights: {
      en: [
        'rewrote the CRM/POS integration in under a year with clearer architecture, more test coverage, and updated documentation',
        'software runs on every cash register in ~1,800 stores across 26 European countries',
        'moved from after-hours deployment windows toward safer deployments during business hours through better error handling, observability, and recovery paths',
        'onboarded 1 senior and 2 junior developers; all productive contributors within weeks',
        'introduced "Full Stack Fridays", team-driven learning sessions covering Figma prototyping, GraphQL, C#/.NET, and more',
        'built an in-house shortlink and QR service in Next.js + .NET in weeks, replacing a third-party SaaS that no longer met business needs',
      ],
      de: [
        'Neuentwicklung der CRM/POS-Integration in unter einem Jahr mit klarerer Architektur, mehr Testabdeckung und aktualisierter Dokumentation',
        'Software läuft auf jedem Kassenterminal in ~1.800 Filialen in 26 europäischen Ländern',
        'von After-Hours-Deploymentfenstern zu sichereren Deployments im laufenden Betrieb durch bessere Fehlerbehandlung, Observability und klare Recovery-Pfade',
        '1 Senior und 2 Junior-Entwickler eingearbeitet, alle innerhalb weniger Wochen produktive Beitragende',
        '"Full Stack Fridays" eingeführt, teamgetriebene Lernsessions zu Figma, GraphQL, C#/.NET und mehr',
        'Inhouse-Shortlink- und QR-Service in Next.js + .NET in wenigen Wochen von Anfrage bis Produktion gebaut, als Ersatz für einen Drittanbieter-SaaS',
      ],
    },
    technologies: [
      'react',
      'typescript',
      'angular',
      'next.js',
      'dotnet',
      'csharp',
      'mongodb',
      'kubernetes',
      'azure-devops',
      'instana',
      'grafana',
    ],
    startDate: '2024-01',
    endDate: '2025-10',
    featured: true,
    spotlight: true,
  },
  {
    id: '20',
    company: 'Douglas GmbH',
    industry: {
      en: 'Retail',
      de: 'Einzelhandel',
    },
    title: {
      en: 'Solutions Architect',
      de: 'Lösungsarchitekt',
    },
    description: {
      en: 'Contract extended with broader scope: unify the CRM API landscape and modernise how the team works. Designed and built a unified API gateway (REST + GraphQL) replacing direct frontend access to upstream services, and introduced governed AI tooling for daily delivery work.',
      de: 'Vertragsverlängerung mit erweitertem Scope: Vereinheitlichung der CRM-API-Landschaft und Modernisierung der Arbeitsweise im Team. Konzeption und Bau eines API-Gateways (REST + GraphQL) als einheitliche Schnittstelle statt Direktzugriff auf Upstream-Services, dazu KI-Tooling mit klaren Leitplanken für die tägliche Arbeit.',
    },
    city: 'Düsseldorf',
    highlights: {
      en: [
        'designed a unified CRM API (REST + GraphQL), ending business logic duplicated across multiple frontends',
        'picked up C#/.NET during the engagement — with AI assistance and architecture patterns that transfer across stacks — to design and ship the API myself',
        'replaced static code-level mandator configuration with dynamic runtime config served by the API — config changes no longer require a release',
        'built a TypeScript agent CLI giving AI agents governed access to Jira, Confluence, Azure DevOps, and internal tooling, with human review of all output',
        'developed an internal delivery platform that grew from a team page into a blog, planning, and configuration hub',
        'supported the team\'s migration to an improved Jira workflow',
        'identity and access management throughout: Entra ID, OAuth flows, API permissions, group management',
      ],
      de: [
        'einheitliche CRM-API (REST + GraphQL) konzipiert – Schluss mit duplizierter Businesslogik in mehreren Frontends',
        'C#/.NET im laufenden Projekt gelernt – mit KI-Unterstützung und Architekturmustern, die über Stacks hinweg tragen – um das API-Gateway selbst zu konzipieren und umzusetzen',
        'statische Mandantenkonfiguration im Code durch dynamische Runtime-Konfiguration über die API ersetzt – Konfigurationsänderungen brauchen kein Release mehr',
        'TypeScript-Agent-CLI gebaut, das KI-Agenten kontrollierten Zugriff auf Jira, Confluence, Azure DevOps und interne Tools gibt – mit menschlichem Review aller Ergebnisse',
        'interne Delivery-Plattform entwickelt, die von einer Teamseite zu Blog-, Planungs- und Konfigurations-Hub gewachsen ist',
        'Team bei der Migration auf einen verbesserten Jira-Workflow unterstützt',
        'durchgängig Identity & Access Management: Entra ID, OAuth-Flows, API-Berechtigungen, Gruppenverwaltung',
      ],
    },
    technologies: [
      'dotnet',
      'csharp',
      'graphql',
      'rest',
      'typescript',
      'react',
      'next.js',
      'mongodb',
      'kubernetes',
      'azure-devops',
      'entra-id',
      'oauth',
      'grafana',
    ],
    startDate: '2025-10',
    endDate: '2026-07',
    featured: true,
    spotlight: true,
  }
];
