import { LitElement, html, customElement, css } from 'lit-element';

import "./cd-resume-item";
@customElement('page-resume')
export class PageResume extends LitElement {

  static get styles() {
    return css`
      :host {
        --border-color: #CCC;
        display: block;
      }

      a {
        color: inherit;
      }

      .page {
        background-color: #FFF;
        border: 1px solid rgba(0,0,0,0.025);
        box-shadow: 0 1rem 3rem rgba(0,0,0,0.175);
        max-width: 1140px;
        margin: 80px auto;
        padding: 3rem;
      }

      @media print {
        .no-print {
          display: none;
        }

        .page {
          margin: 0;
          box-shadow: none;
          border: none;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        cd-resume-item {
          break-inside: avoid;
        }
      }

      .cover {
        display: grid;
        grid-template:
          "name address" max-content
          "title address" max-content
          "intro intro" max-content
          "summary skills" auto
          / 1fr max-content
        ;
      }

      .cover h1 {
        grid-area: name;
        font-size: 40px;
        margin: 0;
      }

      .cover h2 {
        grid-area: title;
        font-size: 20px;
        font-weight: 300;
      }

      h3 {
        font-size: 20px;
      }

      .cover address {
        grid-area: address;
        padding-left: 1em;
        border-left: 1px solid var(--border-color);
      }

      .cover .intro {
        grid-area: intro;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        margin: 1em 0;
      }

      .cover .summary {
        grid-area: summary;
        padding-right: 1em;
      }

      .cover .skills {
        grid-area: skills;
        padding-left: 1em;
        border-left: 1px solid var(--border-color);
      }

      ul, li {
        padding: 0;
        margin: 0;
        list-style-type: none;
      }
    `;
  }

  private handleClick(e) {
    e.preventDefault();
    const detail = {
      pathname: e.target.pathname
    };
    const event = new CustomEvent("nav-click", { detail });

    this.dispatchEvent(event)
  }

  render() {
    return html`
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css" integrity="sha384-REHJTs1r2ErKBuJB0fCK99gCYsVjwxHrSU0N7I1zl9vZbggVJXRMsv/sLlOAGb4M" crossorigin="anonymous">
      <p class="no-print">DEVMODE: <a @click="${this.handleClick}" href="/about">Click here to get to the landing page</a></p>
      <div class="page cover">
        <h1>Martin Trenker</h1>
        <h2>Cloud Native Software Engineer</h2>
        <address>
          <i class="fas fa-phone"></i> +49 (0)170/919-1337 <br />
          <i class="fas fa-envelope"></i> trenker.martin@gmail.com <br />
          <i class="fas fa-globe"></i> <a href="https://clean.dev">https://clean.dev</a> <br />
        </address>

        <div class="intro">
          <p>
            Software development fascinated me for as long as I can think, especially the web caught my attention early on with it’s almost unlimited possibilities.
            As a teenager, I started building websites at Internet Cafés until I got my own PC (166MHz, MMX!) and started to become more involved in developer communities through things like
            IRC where I spent a lot of time helping others with questions about HTML, CSS, JS and PHP/MySQL.
          </p>
          <p>
            After finishing my 3-Year Apprenticeship  as a “IT-System-Kaufmann” at the Deutsche Telekom AG in 2005,
            I worked as a Developer for small companies until 2008, where I started my own Business which I work for Fulltime to this day,
            working for clients all over Germany to help them get their product quickly and reliably to their customers without sacrificing maintainability or extensibility.
          </p>
        </div>

        <div class="skills">
          <h3>Skills</h3>
          <h4>Technologies</h4>
          <ul>
            <li>AWS</li>
            <li>HTML5/CSS3</li>
            <li>TypeScript</li>
            <li>Webcomponents</li>
            <li>Node.js</li>
            <li>Webpack</li>
          </ul>

          <h4>Methodologies</h4>
          <ul>
            <li>DevSecOps</li>
            <li>Agile (Scrum, Kanban)</li>
            <li>Design thinking</li>
            <li>Safety-II</li>
            <li>Infrastructure as code</li>
            <li>BDD/TDD</li>
            <li>CI/CD</li>
            <li>OKR</li>
          </ul>

          <h4>Languages</h4>
          <ul>
            <li>German (native)</li>
            <li>English (professional)</li>
          </ul>

          <h4>Certificates</h4>
          <ul>
            <li>AWS Cloud Practitioner</li>
            <li>AWS Developer Associate</li>
          </ul>
        </div>

        <div class="summary">
          <h3>Work Experience</h3>

          <cd-resume-item from="2019-07-01" to="2020-01-01" position="Fullstack Developer">
            <p>
              Developing a reusable component library and implementing them with a headless CMS to reduce implemnentation efforts for the clients multi-tenant website.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2019-04-01" to="2019-07-01" position="Fullstack Developer">
            <p>
              Helping maintain and develop the current, vue based platform while also building a new stack based on react
              and introducing a headless CMS to enable Marketing to efficiently manage the content themselves.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2018-08-01" to="2019-01-01" position="Fullstack Developer">
            <p>
              Developing
            </p>
          </cd-resume-item>

          <cd-resume-item from="2017-11-01" to="2018-05-01" position="Fullstack Developer">
            <p>
              Supporting the client developing a versatile component library to relaunching their landingpage after a major redesign.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2016-11-01" to="2017-11-01" position="Frontend Developer">
            <p>
              Developing a component library to replace the embedded monitoring on the clients production lines with a web-based solution to allow easier customization
              of their customers unique requirements.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2016-08-01" to="2016-10-01" position="Frontend Developer">
            <p>
              Reverse engineered an existing iOS app and developed a Windows Phone App to quickly reach customers who switched to Windows feature phones.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2016-04-01" to="2016-07-01" position="Fullstack Developer">
            <p>
              Planning and developing a intranet solution to allow the receptionists to quickly take photos of visitors and print visitors badges.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2014-09-01" to="2016-06-01" position="Fullstack Developer">
            <p>
              Conception and development of the intranet platform relaunch to provide the clients staff with a self-service portal to upgrade their devices in any office across all regions.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2013-05-01" to="2014-02-01" position="Fullstack Developer">
            <p>
              Adding a software self-service to an existing intranet application that allows the clients staff to upgrade their software licenses themselves.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2013-01-01" to="2013-07-01" position="Fullstack Developer">
            <p>
              Conception and development of a survey tool for a client in the automotive industry to allow them to evaluate and improve their global dealerships.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2012-08-01" to="2014-10-01" position="Fullstack Developer">
            <p>
              Maintaining the existing intranet platform that allows the client’s staff to plan their device upgrades world-wide.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2012-07-01" to="2016-01-01" position="Fullstack Developer">
            <p>
              Building and maintaining an internal auction platform for the clients yearly christmas auctions across their Europe offices.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2010-12-01" to="2011-10-01" position="Frontend Developer">
            <p>
              Helping the customer to develop a (sadly never released) browser based game.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2009-02-01" to="2012-07-01" position="Fullstack Developer">
            <p>
              Maintenance and improvements of the clients intranet based asset management platform.
            </p>
          </cd-resume-item>

          <cd-resume-item from="2008-11-01" to="2009-02-01" position="Frontend Developer">
            <p>
              Building Sharepoint sites for various departments.
            </p>
          </cd-resume-item>

        </div>
      </div>
    `;
  }
}
