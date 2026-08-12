import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import indexCss from './index.css?inline';
import { data } from './core/seeds/user-data';
import type { UserData } from './types';

const tagName = 'dm-tool-user';

class UsersWidget extends HTMLElement {
  private _userData: UserData | undefined;
  private root: ReactDOM.Root | undefined;

  static get observedAttributes() {
    return ['user-data'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'user-data' && oldValue !== newValue) {
      if (newValue === '[object Object]') {
        console.warn('⚠️ dm-tool-user: Received "[object Object]" as user-data attribute. Please use property binding [userData]="userData" or pass a JSON string.');
        return;
      }
      try {
        this._userData = JSON.parse(newValue) as UserData;
        this.renderReactApp();
      } catch (e) {
        console.error('❌ Invalid user-data JSON:', e);
      }
    }
  }

  set userData(value: UserData | undefined) {
    this._userData = value;
    this.renderReactApp();
  }

  get userData() {
    return this._userData;
  }

  connectedCallback() {
    setTimeout(() => {
      const rawData = this.getAttribute('user-data');
      if (rawData === '[object Object]') {
        console.warn('⚠️ dm-tool-user: Received "[object Object]" as user-data attribute on load.');
      } else {
        try {
          if (rawData) {
            this._userData = JSON.parse(rawData) as UserData;
          }
        } catch (e) {
          console.error('❌ Invalid user-data JSON:', e);
        }
      }
      this.renderReactApp();
    }, 0);
  }

  renderReactApp() {
    const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = indexCss;
    shadowRoot.appendChild(style);

    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    this.root = ReactDOM.createRoot(mountPoint);
    this.root.render(<App userData={this._userData} />);
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, UsersWidget);
}

// Dev preview support — when running standalone with `npm run dev`
const devRoot = document.getElementById('root');
if (devRoot) {
  const el = document.createElement(tagName);
  el.setAttribute('user-data', JSON.stringify(data));
  devRoot.appendChild(el);
}
