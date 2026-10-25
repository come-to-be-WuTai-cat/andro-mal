import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './app/router';
import { queryClient } from './app/queryClient';
import { ScanProvider } from './features/scans/ScanContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScanProvider>
        <RouterProvider router={router} />
      </ScanProvider>
    </QueryClientProvider>
  );
}

export default App;
