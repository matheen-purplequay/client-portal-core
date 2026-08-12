"use client";

import './App.css'
import { AppContext } from './core/utils/stores/AppContext';
import Home from './modules/home';
import { PageProvider } from './core/utils/stores/PageContext';
import StatisticsPanel from './modules/components/statistics-panel-home/statistics-panel';
import { QueryMasterProvider } from './core/utils/stores/QueryMasterContext';
import { ClientSelectionProvider } from './core/utils/stores/ClientSelectionContext';


function App({ userData, jobId }: { userData: any; jobId?: string | null }) {

  const isClient = !userData?.isTester;
  console.log('user data in app tsx ', userData)

  return (
    <AppContext.Provider value={{ userData, isClient, jobId }}>
      <PageProvider>
        <QueryMasterProvider>
          <ClientSelectionProvider userData={userData}>
            <div className='max-w-full mx-auto px-3 flex gap-4 space-y-4 flex-col'>
              <StatisticsPanel />
              <Home />
            </div>
          </ClientSelectionProvider>
        </QueryMasterProvider>
      </PageProvider>
    </AppContext.Provider>
  );
}

export default App;
