// Force light theme immediately to avoid flash of dark theme
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    localStorage.setItem('theme','light');
    document.documentElement.setAttribute('data-theme','light');
    document.body.classList.remove('dark-mode');
  } catch (e) {
    // ignore
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/theme.css'
import './index.css'
import './styles/components/ModalFix.css'
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import App from './App.jsx'
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>,
)
