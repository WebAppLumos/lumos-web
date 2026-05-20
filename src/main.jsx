import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Assignment from './Assignment/Assignment.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Assignment />
  </StrictMode>,
)
