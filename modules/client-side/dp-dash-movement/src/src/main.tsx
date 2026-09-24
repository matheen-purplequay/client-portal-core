import ReactDOM from 'react-dom/client';
import App from './App';
import './tailwind.css';
import tailwind from './tailwind.css?inline'; // 👈 Make sure this is inlined!
import main from './main.css?inline';
import { data} from './core/seeds/user-data';
import { encryptData } from './core/utils/helpers/localStorage';

class MyReactWidget extends HTMLElement {
  private _userData: any = {};
  private _selectedClientUser: any = {};
  private root: any;
  private mountPoint: HTMLDivElement | null = null;

  static get observedAttributes() {
    // Only watch user-data; we’ll handle selectedClientUser via setter
    return ['user-data'];
  }

  // This runs when user-data changes in Angular
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'user-data' && oldValue !== newValue) {
      try {
        this._userData = JSON.parse(newValue);
        this.renderReactApp();
      } catch (e) {
        console.error('❌ Invalid user-data JSON:', e);
      }
    }

     if (name === 'selectedClientUser' && oldValue !== newValue) {
      try {
        this._selectedClientUser = JSON.parse(newValue);
        this.renderReactApp();
      } catch (e) {
        console.error('❌ Invalid user-data JSON:', e);
      }
    }
  }

  // This will be triggered when Angular updates selectedClientUser property
  set selectedClientUser(value: any) {
    this._selectedClientUser = value;
    this.renderReactApp();
  }

  get selectedClientUser() {
    return this._selectedClientUser;
  }

  connectedCallback() {
    // Initial load
    setTimeout(() => {
      const rawData = this.getAttribute('user-data');
      try {
        if (rawData) {
          this._userData = JSON.parse(rawData);
        }
      } catch (e) {
        console.error('❌ Invalid user-data JSON:', e);
      }
      this.renderReactApp();
    }, 0);
  }

  renderReactApp() {
    // Angular's attribute binding, property binding, and this element's own
    // connectedCallback all call this independently, often within the same
    // tick on initial load. This used to call ReactDOM.createRoot() fresh
    // every time — spinning up a brand-new React tree (and re-firing every
    // top-level useEffect/data fetch, e.g. get-verticals/get-manager-status)
    // 3x on a single page load, on top of leaking the previous root's DOM.
    // Now the shadow root/styles/mount point/React root are created once;
    // later calls just re-render the existing root with the latest props,
    // which React reconciles without remounting (so effects don't refire).
    if (!this.root) {
      const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });

      const twStyle = document.createElement('style');
      twStyle.textContent = tailwind;
      shadowRoot.appendChild(twStyle);

      const mainStyle = document.createElement('style');
      mainStyle.textContent = main;
      shadowRoot.appendChild(mainStyle);

      this.mountPoint = document.createElement('div');
      shadowRoot.appendChild(this.mountPoint);

      this.root = ReactDOM.createRoot(this.mountPoint);
    }

    const passedData = {
      userData: this._userData,
      selectedClientUser: this._selectedClientUser
    };

    this.root.render(<App {...passedData} />);
  }
}

if (!customElements.get('dash-movement')) {
  customElements.define('dash-movement', MyReactWidget);
}

// ✅ Dev preview support
const devRoot = document.getElementById('root');
if (devRoot) {
  const el = document.createElement('dash-movement');
  if(data){
    localStorage.setItem('userdata', encryptData(JSON.stringify(data)) || '');
  }
  el.setAttribute('user-data', JSON.stringify(data));
  devRoot.appendChild(el);
}
