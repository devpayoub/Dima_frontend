import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import SeoManager from '@/app/SeoManager';
import AppRoutes from '@/app/AppRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SeoManager />
        <Analytics />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
