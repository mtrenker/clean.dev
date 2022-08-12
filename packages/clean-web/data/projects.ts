interface BaseProject {
  id?: string;
  title: string;
  description: string;
  city: string;
  highlights: string[];
  startDate: string;
  endDate: string;
}

interface IndustryProject extends BaseProject {
  industry: string;
}

interface PublicProject extends BaseProject {
  company: string;
}

export type Project = IndustryProject | PublicProject;

export const projects: Project[] = [
  {
    company: 'Siemens AG',
    title: 'Web Developer',
    description: 'Developing and maintaining Sites in a Share point environment.',
    city: 'Munich',
    highlights: [],
    startDate: '11-2008',
    endDate: '02-2009',
  }, {
    company: 'McKinsey & Company',
    title: 'Web Developer',
    description: 'Developing and maintenance of an asset management system based on PHP, ExtJS, Oracle DB in an Agile team.',
    city: 'Munich',
    highlights: [],
    startDate: '02-2009',
    endDate: '07-2012',
  }, {
    company: 'Travian Games',
    title: 'Web Developer',
    description: 'Developing the JavaScript components for Web based Browser game with MooTools',
    city: 'Munich',
    highlights: [],
    startDate: '12-2010',
    endDate: '10-2011',
  }, {
    company: 'Mindogo GmbH',
    title: 'Web Developer',
    description: 'Development and maintenance of a web based auction tool for an office wide, yearly charity auction based on Laravel 3, AngularJS and MySQL',
    city: 'Munich',
    highlights: [],
    startDate: '07-2012',
    endDate: '01-2016',
  }, {
    company: 'McKinsey & Company',
    title: 'Web Developer',
    description: 'Development and maintenance of a word-wide Hardware-Migration-Management system for a leading Consulting Company using Zend Framework 1, Oracle DB and custom JavaScript',
    city: 'Munich',
    highlights: [],
    startDate: '08-2012',
    endDate: '10-2014',
  }, {
    company: 'BMW Group',
    title: 'Web Developer',
    description: 'Creating a web-based Survey System for a bavarian automotive company to help evaluate their world-wide dealerships',
    city: 'Munich',
    highlights: [],
    startDate: '01-2013',
    endDate: '07-2013',
  }, {
    company: 'McKinsey & Company',
    title: 'Lead Developer',
    description: 'Migration Bookking 2.0 - Migration of a legacy system to a new system using Zend Framework 2, Oracle DB and custom JavaScript',
    city: 'Munich',
    highlights: [],
    startDate: '09-2014',
    endDate: '06-2016',
  }, {
    company: 'Mindogo GmbH',
    title: 'Lead Developer',
    description: 'People Management System',
    city: 'Munich',
    highlights: [],
    startDate: '04-2016',
    endDate: '07-2016',
  }, {
    company: 'F24 AG',
    title: 'Lead Developer',
    description: 'Migrating Apple App to Android using React and Cordova',
    city: 'Munich',
    highlights: [],
    startDate: '08-2016',
    endDate: '10-2016',
  }, {
    company: 'Brückner Group',
    title: 'Frontend Developer',
    description: 'Developing Webcomponents based on Polymer for embedded Machines',
    city: 'Siegsdorf',
    highlights: [],
    startDate: '11-2016',
    endDate: '11-2017',
  }, {
    company: 'Lufthansa AG',
    title: 'Frontend Developer',
    description: 'Developing react components for usage in Adobe Experience Manager',
    city: 'Hamburg',
    highlights: [],
    startDate: '11-2017',
    endDate: '05-2018',
  }, {
    company: 'Fineway AG',
    title: 'Frontend Developer',
    description: 'Developing react components for a travel magazine',
    city: 'Munich',
    highlights: [],
    startDate: '08-2018',
    endDate: '12-2018',
  }, {
    company: 'InstaMotion Retail GmbH',
    title: 'Frontend Developer',
    description: 'Developing a react based magazine connected to a headless CMS',
    city: 'Munich',
    highlights: [],
    startDate: '04-2019',
    endDate: '07-2019',
  }, {
    company: 'ProSiebenSat.1 Digital GmbH',
    title: 'Frontend Developer',
    description: 'Developing and maintaining ',
    city: 'Munich',
    highlights: [],
    startDate: '07-2019',
    endDate: '01-2020',
  }, {
    company: 'Interhyp AG',
    title: 'Frontend Developer',
    description: 'Developing communication center for employees',
    city: 'Munich',
    highlights: [],
    startDate: '07-2020',
    endDate: '04-2021',
  }, {
    company: 'Fielmann AG',
    title: 'Frontend Developer',
    description: 'Refactoring the AngularJS based ',
    city: 'Munich',
    highlights: [],
    startDate: '03-2021',
    endDate: '12-2021',
  }, {
    company: 'UXMA GmbH & Co. KG',
    title: 'Frontend Developer',
    description: 'Refactoring the AngularJS based tablet application with react',
    city: 'Munich',
    highlights: [],
    startDate: '01-2022',
    endDate: '07-2022',
  },
];
