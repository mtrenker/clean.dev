import { LitElement, html, property, customElement, css } from 'lit-element';

@customElement('cd-resume-item')
export class CdResumeItem extends LitElement {

  @property() industry = '';
  @property() client = '';
  @property() from = '';
  @property() to = '';
  @property() position = '';

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template:
          "position customer time"
          "description description description"
          / 5fr  max-content max-content
        ;
      }

      h4, h5 {
        margin: 0;
      }

      h5 {
        font-size: 14px;
        padding-right: 1em;
        border-right: 1px solid #CCC;
      }

      time {
        padding-left: 1em;
      }

      ::slotted(p) {
        grid-area: description;
      }
    `;
  }

  render() {
    const dateFormatOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
    return html`
      <h4>${this.position}</h4>
      <h5>${this.client || this.industry}</h5>
      <time>
        ${Intl.DateTimeFormat(undefined, dateFormatOptions).format(new Date(this.from))} -
        ${Intl.DateTimeFormat(undefined, dateFormatOptions).format(new Date(this.to))}
      </time>
      <slot></slot>
    `;
  }
}
