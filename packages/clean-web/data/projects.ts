interface Project {
  id?: string;
  industry?: string;
  company?: string;
  title: string;
  description: string;
  city: string;
  highlights: string[];
  startDate: string;
  endDate: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    company: 'Siemens AG',
    title: 'Web Developer',
    description: 'Developing and maintaining Sites in a Share point environment.',
    city: 'Munich',
    highlights: [],
    startDate: '2008-11',
    endDate: '2009-02',
    featured: false,
  }, {
    company: 'McKinsey & Company',
    industry: 'Consulting',
    title: 'Web Developer',
    description: 'Developing and maintenance of an asset management system based on PHP, ExtJS, Oracle DB in an Agile team.',
    city: 'Munich',
    highlights: [],
    startDate: '2009-02',
    endDate: '2012-07',
    featured: false,
  }, {
    company: 'Travian Games',
    industry: 'Gaming',
    title: 'Web Developer',
    description: 'Developing the JavaScript components for Web based Browser game with MooTools',
    city: 'Munich',
    highlights: [],
    startDate: '2010-12',
    endDate: '2011-10',
    featured: false,
  }, {
    company: 'Mindogo GmbH',
    industry: 'Consulting',
    title: 'Web Developer',
    description: 'Development and maintenance of a web based auction tool for an office wide, yearly charity auction based on Laravel 3, AngularJS and MySQL',
    city: 'Munich',
    highlights: [],
    startDate: '2012-07',
    endDate: '2016-01',
    featured: false,
  }, {
    company: 'McKinsey & Company',
    industry: 'Consulting',
    title: 'Web Developer',
    description: 'Development and maintenance of a word-wide Hardware-Migration-Management system for a leading Consulting Company using Zend Framework 1, Oracle DB and custom JavaScript',
    city: 'Munich',
    highlights: [],
    startDate: '2012-08',
    endDate: '2014-10',
    featured: false,
  }, {
    company: 'BMW Group',
    industry: 'Automotive',
    title: 'Web Developer',
    description: 'Creating a web-based survey system for global and local evaluation of car dealerships with PHP, Oracle DB, Laravel, AngularJS',
    city: 'Munich',
    highlights: [],
    startDate: '2013-01',
    endDate: '2013-07',
    featured: true,
  }, {
    company: 'McKinsey & Company',
    industry: 'Consulting',
    title: 'Lead Developer',
    description: 'Architected and developed a hardware migration management application with PHP, Oracle DB, Symfony, React',
    city: 'Munich',
    highlights: [
      'CQRS based data-structures',
    ],
    startDate: '2014-09',
    endDate: '2016-06',
    featured: true,
  }, {
    company: 'Mindogo GmbH',
    industry: 'Consulting',
    title: 'Lead Developer',
    description: 'People Management System',
    city: 'Munich',
    highlights: [],
    startDate: '2016-04',
    endDate: '2016-07',
    featured: false,
  }, {
    company: 'F24 AG',
    title: 'Lead Developer',
    description: 'Migrating Apple App to Android using react and Cordova',
    city: 'Munich',
    highlights: [],
    startDate: '2016-08',
    endDate: '2016-10',
    featured: false,
  }, {
    company: 'Brückner Group',
    industry: 'Mascine Manufacturing',
    title: 'Frontend Developer',
    description: 'Developed dashboard components for web-based monitoring applications on their machines',
    city: 'Siegsdorf',
    highlights: [
      'native web components via Polymer',
    ],
    startDate: '2016-11',
    endDate: '2017-11',
    featured: true,
  }, {
    company: 'Lufthansa AG',
    title: 'Frontend Developer',
    description: 'Developing react components for usage in Adobe Experience Manager',
    city: 'Hamburg',
    highlights: [
      'heavy focus on accessibility',
      'modular architecture',
    ],
    startDate: '2017-11',
    endDate: '2018-05',
    featured: true,
  }, {
    company: 'Fineway AG',
    industry: 'Travel',
    title: 'Frontend Developer',
    description: 'Developed and maintained components for an online travel magazine with React, TypeScript, GraphQL',
    city: 'Munich',
    highlights: [],
    startDate: '2018-08',
    endDate: '2018-12',
    featured: true,
  }, {
    company: 'InstaMotion Retail GmbH',
    industry: 'Retail',
    title: 'Frontend Developer',
    description: 'Developed a web magazine connected to a headless CMS with React, GraphQL',
    city: 'Munich',
    highlights: [],
    startDate: '2019-04',
    endDate: '2019-07',
    featured: true,
  }, {
    company: 'ProSiebenSat.1 Digital GmbH',
    industry: 'Media',
    title: 'Frontend Developer',
    description: 'Developed and maintained react components for popular TV formats with React, GraphQL, tracking',
    city: 'Munich',
    highlights: [],
    startDate: '2019-07',
    endDate: '2020-01',
    featured: true,
  }, {
    company: 'Interhyp AG',
    industry: 'Finance',
    title: 'Frontend Developer',
    description: 'Developed components for a communication micro-frontend with React, Redux-Toolkit, VoIP',
    city: 'Munich',
    highlights: [
      'supported the team as an agile coach',
      'positive first WebRTC experience',
    ],
    startDate: '2020-07',
    endDate: '2021-04',
    featured: true,
  }, {
    company: 'Fielmann AG',
    industry: 'Retail',
    title: 'Frontend Developer',
    description: 'Refactored an AngularJS-based server-data/form-data heavy application to a react-based app with TypeScript, XState, React Hook Form',
    city: 'Munich',
    highlights: [
      'heavily leaned into pair-programming to ensure the best knowledge transfer',
      'designed and developed state-machine driven, extensible multi-form architecture',
      'developed custom onscreen keyboards for optimal workflow',
    ],
    startDate: '2021-03',
    endDate: '2021-12',
    featured: true,
  }, {
    company: 'UXMA GmbH & Co. KG',
    title: 'Frontend Developer',
    description: 'Led a team of 3 developers building a server-data-heavy web app written with TypeScript, React, Redux Toolkit, TanStack Table, React MUI',
    city: 'Munich',
    highlights: [
      'constant pair-programming with two juniors for quick and effective knowledge transfer',
      'significantly improved performance by eliminating bottlenecks in render cycles',
    ],
    startDate: '2022-01',
    endDate: '2022-07',
    featured: true,
  },
];
