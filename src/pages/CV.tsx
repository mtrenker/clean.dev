import React, { FC } from "react";
import { css } from "@emotion/core";

import { ProjectList, ProjectItem } from "../components/cv/Projects";
import image from "../../public/images/martin.png";
import { useGetProjectsQuery } from "../graphql/hooks";

const containerCss = css`
  font-family: "Roboto";

  ul, li, h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  display: grid;

  grid-template:
    "header"
    "nav"
    "intro"
    "projects"
    "skills"
    "address"
  ;

  h1 {
    font-size: 24px;
    grid-area: name;
  }

  h2 {
    font-size: 20px;
    grid-area: title;
    margin-bottom: 16px;
  }

  header {
    grid-area: header;
  }

  section > h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  h4 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  img {
    float: right;
  }

  nav {
    grid-area: nav;
    position: sticky;
    top: 0;
    height: 32px;
    background-color: #FFF;
    ul {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      margin: 0;
      li {
        text-align: center;
        line-height: 32px;
        font-size: 18px;
        a {
          text-decoration: none;
        }
      }
    }
  }

  address {
    grid-area: address;
  }

  .intro {
    padding-top: 16px;
    font-size: 16px;
    grid-area: intro;
  }

  .projects {
    grid-area: projects;
  }

  .skills {
    grid-area: skills;
  }

  .projects, .skills {
    padding-top: 48px;
  }

  @media(min-width: 426px) {
    grid-template:
      "header address"
      "intro intro"
      "projects skills"
      / 2fr 1fr
    ;

    nav {
      display: none;
    }
  }
  @media print {
    section > section {
      page-break-inside: avoid;
    }
  }
`;

export const CV: FC = () => {
  const { data } = useGetProjectsQuery();
  return (
    <div css={containerCss}>
      <header>
        <h1>Martin Trenker</h1>
        <h2>Cloud Native Software Engineer</h2>
      </header>

      <nav>
        <ul>
          <li><a href="#intro">Intro</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <section className="contact" id="contact">
        <h3>Contact</h3>
        <address>
          +49 (0)170/919-1337 <br />
          trenker.martin@gmail.com <br />
          https://clean.dev
      </address>
      </section>

      <section className="intro" id="intro">
        <img {...image} width="150" height="150" />
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
      </section>

      <section className="projects" id="projects">
        <h3>Projects</h3>
        {data && data.projects.reverse().map(project => (
          <ProjectList>
            <ProjectItem
              position="Fullstack Developer"
              client={project.client}
              date={`${project.startDate} - ${project.endDate}`}
            >
              {project.description}
            </ProjectItem>
          </ProjectList>
        ))
        }
      </section>

      <section className="skills" id="skills">
        <h3>Skills</h3>
        <section>
          <h4>Technologies</h4>
          <ul>
            <li>AWS</li>
            <li>HTML5/CSS3</li>
            <li>TypeScript</li>
            <li>Webcomponents</li>
            <li>Node.js</li>
            <li>Webpack</li>
          </ul>
        </section>

        <section>
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
        </section>

        <section>
          <h4>Languages</h4>
          <li>German (native)</li>
          <li>English (professional)</li>
        </section>

        <section>
          <h4>Certificates</h4>
          <ul>
            <li>AWS Cloud Practitioner</li>
            <li>AWS Developer Associate</li>
          </ul>
        </section>

        <section>
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
        </section>

        <section>
          <h4>Soft Skills</h4>
          <ul>
            <li>Team Player</li>
            <li>Mentor</li>
            <li>Customer oriented</li>
            <li>Learner</li>
            <li>Autonomous</li>
          </ul>
        </section>
      </section>
    </div>
  );
};
