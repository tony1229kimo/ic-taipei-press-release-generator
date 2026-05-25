import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import GeneratorPage from '@/pages/GeneratorPage';
import HistoryPage from '@/pages/HistoryPage';
import AdminPage from '@/pages/AdminPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<GeneratorPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors />
    </QueryClientProvider>
  );
}

export default App;
