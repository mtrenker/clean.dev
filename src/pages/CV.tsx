import React, { FC } from "react";
import { css } from "@emotion/core";

import { ProjectList, ProjectItem } from "../components/cv/Projects";

const containerCss = css`
  font-family: "Roboto";

  ul, li, h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  display: grid;

  h1 {
    grid-area: name;
  }

  h2 {
    grid-area: title;
  }

  address {
    grid-area: address;
  }

  .intro {
    grid-area: intro;
  }

  .projects {
    grid-area: projects;
  }

  .skills {
    grid-area: skills;
  }

  @media(min-width: 768px) {
    grid-template:
      "name address"
      "title address"
      "intro intro"
      "projects skills"
      / 2fr 1fr
    ;
  }
`;

export const CV: FC = () => {
  return (
    <div css={containerCss}>
      <h1>Martin Trenker</h1>
      <h2>Cloud Native Software Engineer</h2>

      <address>
        +49 (0)170/919-1337 <br />
        trenker.martin@gmail.com <br />
        https://clean.dev
      </address>

      <div className="intro">
        <p>
          Software development fascinated me for as long as I can think, especially the web caught my
          attention early on with it’s almost unlimited possibilities. As a teenager, I started building
          websites at Internet Cafés until I got my own PC (166MHz, MMX!) and started to become more
          involved in developer communities through things like IRC where I spent a lot of time helping
          others with questions about HTML, CSS, JS and PHP/MySQL.
        </p>
        <p>
          After finishing my 3-Year Apprenticeship as a “IT-System-Kaufmann” at the Deutsche Telekom
          AG in 2005, I worked as a Developer for small companies until 2008, where I started my own
          Business which I work for Fulltime to this day, working for clients all over Germany to help them
          get their product quickly and reliably to their customers without sacrificing maintainability or
          extensibility.
        </p>
      </div>

      <div className="projects">

        <ProjectList>
          <ProjectItem position="Fullstack Developer" client="ProSiebenSat.1 Digital GmbH" date="01.07.2019 - 31.12.2019">
            Developing a reusable component library and implementing them with a headless CMS to reduce implemnentation efforts for the clients multi-tenant website.
          </ProjectItem>
        </ProjectList>

      </div>

      <div className="skills">
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
        <li>German (native)</li>
        <li>English (professional)</li>

        <h4>Certificates</h4>
        <ul>
          <li>AWS Cloud Practitioner</li>
          <li>AWS Developer Associate</li>
        </ul>

        <h4>Libraries</h4>
        <ul>
          <li>React</li>
          <li>Jest</li>
          <li>Enzyme</li>
          <li>AWS-SDK</li>
          <li>AWS-CDK</li>
          <li>lit-html/-element</li>
          <li>Storybook</li>
        </ul>

        <h4>Soft Skills</h4>
        <ul>
          <li>Team Player</li>
          <li>Mentor</li>
          <li>Customer oriented</li>
          <li>Learner</li>
          <li>Autonomous</li>
        </ul>
      </div>
    </div>
  );
};
