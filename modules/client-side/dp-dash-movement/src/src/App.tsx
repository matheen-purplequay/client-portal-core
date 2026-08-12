"use client";

import './App.css'
import { AppContext } from './core/utils/stores/AppContext';
import Home from './modules/home';
import { PageProvider } from './core/utils/stores/PageContext';
import StatisticsPanel from './modules/components/statistics-panel-home/statistics-panel';
import { EngagementVerticalProvider } from './core/utils/stores/EngagementVerticalContext';

function App({ userData, selectedClientUser }: { userData: any, selectedClientUser: any }) {
  console.log('user data from react app ', userData);

  return (
    <AppContext.Provider value={{ userData, selectedClientUser }}>
      <PageProvider>
        <EngagementVerticalProvider>
          <div className='max-w-full mx-auto px-3 flex gap-4 space-y-4 flex-col'>
            <StatisticsPanel />
            <Home />
          </div>
        </EngagementVerticalProvider>
      </PageProvider>
    </AppContext.Provider>
  );
}

export default App;
