import { ToastProvider } from '@/components/ui/toast';
import { ClientMaster } from '@/pages/clients/client-master/ClientMaster';
import { setUserData } from '@/stores/userStore';
import type { UserData } from '@/types';

interface AppProps {
  userData?: UserData;
}

function App({ userData }: AppProps) {
  // Store userData in our in-memory store so services/hooks can access it
  if (userData) {
    setUserData(userData);
  }

  return (
    <ToastProvider>
      <ClientMaster />
    </ToastProvider>
  );
}

export default App;
