import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { UserList } from '@/pages/users/UserList';
import { setUserData } from '@/stores/userStore';
import type { UserData } from '@/types';

const queryClient = new QueryClient();

interface AppProps {
  userData?: UserData;
}

function App({ userData }: AppProps) {
  if (userData) setUserData(userData);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <UserList />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
