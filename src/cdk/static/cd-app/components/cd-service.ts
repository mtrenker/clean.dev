import { LitElement, html, property, customElement, css } from 'lit-element';

@customElement('cd-service')
export class CdService extends LitElement {

  @property() label = '';

  static get styles() {
    return css`
      :host {
        display: block;
        border: 1px solid black;
        border-radius: 8px;
        padding: 8px;
      }
    `;
  }

  render() {
    return html`
      <div>
        <h4>${this.label}</h4>
        <p><slot></slot></p>
      </div>
    `;
  }
}
