import { LitElement, html, property, customElement, css } from 'lit-element';

import "./page-about";
import "./page-resume";

type pages = 'about' | 'resume'

@customElement('cd-app')
export class CdApp extends LitElement {
  @property() page: pages = 'about';

  static get styles() {
    return css`
      :host {
        display: block;
        margin: 0 auto;
      }
    `;
  }

  render() {
    return html`
      <header>
        <nav>
          <ul>
            <li><a href="/about" @click="${this._navClick}">About</a></li>
            <li><a href="/resume" @click="${this._navClick}">Resume</a></li>
          </ul>
        </nav>
      </header>
      ${this._renderPage(this.page)}
    `;
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
