import { LitElement, html, property, customElement, css } from 'lit-element';

import "./cd-service";

@customElement('page-about')
export class PageAbout extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .container {
        max-width: 1440px;
        margin: 0 auto;
      }

      .about {
        background-color: #ededed;
      }

      .about .container {
        display: grid;
        grid-template:
        "name name image"
        "title title image"
        "description description image"
        / 1fr 1fr 350px;
        justify-content: flex-start;
      }

      .about img {
        grid-area: image;
      }
      .about h1 {
        grid-area: name;
      }
      .about h2 {
        grid-area: title;
      }
      .about p {
        grid-area: description;
      }

      .services {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 10px;
      }
    `;
  }

  render() {
    return html`
      <section class="about">
        <div class="container">
          <img src="https://picsum.photos/350" alt="Martin Trenker" />
          <h1>Martin Trenker</h1>
          <h2>Cloud Native Software Engineer</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Doloremque atque quaerat maiores sapiente? Ratione consectetur,
            ab reiciendis voluptate consequuntur nihil maxime delectus,
            inventore deserunt, nesciunt aliquid quaerat non eveniet iure.
          </p>
        </div>
      </section>

      <section>
        <div class="container">
          <h3>Services</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Doloremque atque quaerat maiores sapiente? Ratione consectetur,
            ab reiciendis voluptate consequuntur nihil maxime delectus,
            inventore deserunt, nesciunt aliquid quaerat non eveniet iure.
          </p>
          <div class="services">
            <cd-service label="JavaScript/TypeScript">
              Brief intro to this
            </cd-service>

            <cd-service label="Automation">
              Brief intro to this
            </cd-service>

            <cd-service label="HTML/CSS">
              Brief intro to this
            </cd-service>

            <cd-service label="DevSecOps">
              Brief intro to this
            </cd-service>

            <cd-service label="Clean Code">
              Brief intro to this
            </cd-service>

            <cd-service label="Cloud Native">
              Brief intro to this
            </cd-service>

            <cd-service label="Testing">
              Brief intro to this
            </cd-service>

            <cd-service label="Big Data">
              Brief intro to this
            </cd-service>
          </div>
        </div>
      </section>
    `;
  }
}
