import { LitElement, html, customElement, css } from 'lit-element';

@customElement('page-resume')
export class PageResume extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .page {
        background-color: #FFF;
        border: 1px solid rgba(0,0,0,0.025);
        box-shadow: 0 1rem 3rem rgba(0,0,0,0.175);
        max-width: 1140px;
        margin: 80px auto;
      }

      .cover {
        display: grid;
        grid-template:
          "name address" max-content
          "title address" max-content
          "intro intro" max-content
          "summary skills" auto
        ;
      }

      .cover h1 {
        grid-area: name;
      }

      .cover h2 {
        grid-area: title;
      }

      .cover address {
        grid-area: address;
      }

      .cover .intro {
        grid-area: intro;
      }

      .cover .summary {
        grid-area: summary;
      }

      .cover .skills {
        grid-area: skills;
      }
    `;
  }

  render() {
    return html`
      <div class="page cover">
        <h1>Martin Trenker</h1>
        <h2>Cloud Native Software Engineer</h2>
        <address>
          Martin Trenker
        </address>

        <div class="intro">
        <p>
          Software fascinated me since I can think, especially the web caught my attention early on with it’s almost unlimited possibilities. As a teenager, I started building classical GeoCities pages in an Internet Café until I got my own PC (166MHz, MMX!) and started to become also more involved in developer communities through things like IRC, where I spent a lot of time helping others with questions about HTML, CSS, JS and PHP/MySQL.
        </p>
        <p>
          After finishing my 3-Year Apprenticeship  as a “IT-System-Kaufmann” at the Deutsche Telekom AG in 2005, I worked as a Developer for small companies until 2008, when I started my own Business which I work for Fulltime to this day, working for clients all over Germany to help them get their product quickly and reliably to their customers without sacrificing maintainability or extensibility.
        </p>

        <p>
          The biggest challenges today are not the technologies themselves, they seem to be predictable enough to an expert to not worry too much about it, instead, it becomes more and more obvious that cultural challenges are what cost a lot of companies a lot of potential, after spending so much time perfecting my tech-tools, I now have the luxury to look closer at those challenges, identifying constraints and optimizing work from a people-centric perspective.
        </p>
        <p>
          Happy developers write good products, good products create happy customers, happy customers make successful companies.
        </p>
        </div>

        <div class="skills">
          <ul>
            <li>Skill 1</li>
            <li>Skill 2</li>
            <li>Skill 3</li>
            <li>Skill 4</li>
            <li>Skill 5</li>
          </ul>
        </div>

        <div class="summary">
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Cum deserunt soluta minima voluptas corporis nesciunt?
            Quae voluptatibus harum eaque commodi repellendus sed maiores eligendi?
            Excepturi beatae quae impedit distinctio dolore.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Cum deserunt soluta minima voluptas corporis nesciunt?
            Quae voluptatibus harum eaque commodi repellendus sed maiores eligendi?
            Excepturi beatae quae impedit distinctio dolore.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Cum deserunt soluta minima voluptas corporis nesciunt?
            Quae voluptatibus harum eaque commodi repellendus sed maiores eligendi?
            Excepturi beatae quae impedit distinctio dolore.
          </p>
        </div>
      </div>
    `;
  }
}
