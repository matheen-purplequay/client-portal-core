import ReactDOM from 'react-dom/client';
import App from './App';
import './tailwind.css';
import tailwind from './tailwind.css?inline'; // 👈 Make sure this is inlined!
import main from './main.css?inline';
import { data } from './core/seeds/user-data';
import { encryptData } from './core/utils/helpers/localStorage';

const tagName = 'dash-queries';

class MyReactWidget extends HTMLElement {
  connectedCallback() {
    setTimeout(() => {
      const rawData = this.getAttribute('user-data');
      let passedData: { userData: any; jobId?: string | null } = { userData: {} };

      try {
        if (rawData) {
          console.log('raw data from parent ', rawData);
          passedData.userData = JSON.parse(rawData);
          console.log('raw data from parent ', passedData.userData);
        }
      } catch (e) {
        console.error('❌ Invalid user-data JSON:', e, rawData);
      }

      const jobId = new URLSearchParams(window.location.search).get('job_id');
      passedData.jobId = jobId;

      const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = '';

      // Inject Tailwind styles
      const twStyle = document.createElement('style');
      twStyle.textContent = tailwind;
      shadowRoot.appendChild(twStyle);

      // Inject custom app styles
      const mainStyle = document.createElement('style');
      mainStyle.textContent = main;
      shadowRoot.appendChild(mainStyle);

      // Mount React app
      const mountPoint = document.createElement('div');
      shadowRoot.appendChild(mountPoint);

      const root = ReactDOM.createRoot(mountPoint);
      root.render(<App {...passedData} />);
    }, 0); // Set timeout to let Angular set attributes first
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, MyReactWidget);
}

// ✅ Dev preview support
const devRoot = document.getElementById('root');
if (devRoot) {
  const el = document.createElement(tagName);
    if(data){
    localStorage.setItem('userdata', encryptData(JSON.stringify(data)) || '');
  }

  el.setAttribute('user-data', JSON.stringify(data));
  devRoot.appendChild(el);
}
