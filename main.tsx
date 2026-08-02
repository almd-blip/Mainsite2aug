import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CmsContentProvider } from './CmsContentProvider';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CmsContentProvider>
        <App />
      </CmsContentProvider>
    </ErrorBoundary>
  </StrictMode>,
);
