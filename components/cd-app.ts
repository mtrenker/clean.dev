import { LitElement, html, property, customElement, css } from 'lit-element';

import "./page-about";
import "./page-resume";

type pages = 'about' | 'resume'

@customElement('cd-app')
export class CdApp extends LitElement {
  @property() page: pages = 'resume';

  static get styles() {
    return css`
      :host {
        display: block;
        margin: 0 auto;
      }
    `;
  }

  render() {
    return html`${this._renderPage(this.page)}`;
  }

  _renderPage(page: pages) {
    switch (page) {
      case 'resume':
        return html`<page-resume></page-resume>`;
      case 'about':
      default:
        return html`<page-about></page-about>`;
    }
  }

  _navClick(e: any) {
    e.preventDefault();
    const pageName = e.target.pathname.substr(1);
    this.page = pageName;
  }
}
