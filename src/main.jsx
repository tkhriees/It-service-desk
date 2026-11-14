import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { TicketProvider } from './hooks/useTickets';
import App from './App';
import './styles/index.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><HashRouter><TicketProvider><App/></TicketProvider></HashRouter></React.StrictMode>);
