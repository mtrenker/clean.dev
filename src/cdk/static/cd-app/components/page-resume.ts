import { LitElement, html, property, customElement, css } from 'lit-element';

@customElement('page-resume')
export class PageResume extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .resume {
        background-color: #FFF;
        border: 1px solid rgba(0,0,0,0.025);
        box-shadow: 0 1rem 3rem rgba(0,0,0,0.175);
      }
    `;
  }

  render() {
    return html`
      <div class="wrapper">
        <article class="resume">
          <h1>Martin Trenker</h1>
          <h2>Software Depp</h2>
        </article>
      </div>
    `;
  }
}
