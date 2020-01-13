import { LitElement, html, property, customElement, css } from 'lit-element';

type levels = "beginner" | "proficient" | "expert"

@customElement('cd-service')
export class CdService extends LitElement {

  @property() label = '';
  @property() level: levels = 'beginner';

  static get styles() {
    return css`
      :host {
        display: grid;
        border: 1px solid gray;
        border-radius: 8px;
        overflow: hidden;
        align-items: flex-end;
      }

      h4 {
        margin-top: 100px;
        margin-bottom: 0;
        padding: 8px;
        font-size: 32px;
        background: rgba(255, 255, 255, .80);
      }

      .description {
        position: relative;
        background: #FFF;
        height: 150px;
        align-self: flex-end;
        padding: 8px;
        margin-top: 0;
        margin-bottom: 0;
      }

      .level {
        margin: 0;
        position: relative;
        bottom: 0;
        right: 0;
        left: 0;
        padding: 8px;
        text-align: right;
        background: rgba(255, 255, 255, .85);
      }
    `;
  }

  render() {
    return html`
      <h4>${this.label}</h4>
      <p class="description"><slot></slot></p>
      <p class="level">Level: ${this.level}</p>
    `;
  }
}
