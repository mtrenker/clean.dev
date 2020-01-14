import { LitElement, html, property, customElement, css } from 'lit-element';

import "./page-about";
import "./page-resume";

type pages = 'about' | 'resume'

@customElement('cd-app')
export class CdApp extends LitElement {
  @property() page: pages = location.pathname.substr(1);

  static get styles() {
    return css`
      :host {
        @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');
        display: block;
        margin: 0 auto;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        color: #4F4F4F;
      }
    `;
  }

  render() {
    return html`
      ${this._renderPage(this.page)}
    `;
  }

  _renderPage(page: pages) {
    switch (page) {
      case 'resume':
        return html`<page-resume @nav-click="${this.navClick}"></page-resume>`;
      case 'about':
      default:
        return html`<page-about @nav-click="${this.navClick}"></page-about>`;
    }
  }

  private navClick(e: any) {
    e.preventDefault();
    const pageName = e.detail.pathname.substr(1);
    this.page = pageName;
    history.pushState({}, "", `/${pageName}`);
  }
}
