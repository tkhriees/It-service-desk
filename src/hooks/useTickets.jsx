
import { createContext, useContext, useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';

const Context = createContext();

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function reload() {
    let user = null;

    try {
      user = JSON.parse(sessionStorage.getItem('campusdesk-user'));
    } catch {
      user = null;
    }

    if (!user?.token) {
      setTickets([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ticketService.list();
      setTickets(result);
    } catch (e) {
      setTickets([]);
      setError(e.message || 'Could not load tickets from the backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();

    function handleAuthChange() {
      setTickets([]);
      reload();
    }

    window.addEventListener('campusdesk-auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('campusdesk-auth-changed', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(''), 4500);
      return () => clearTimeout(id);
    }
  }, [notice]);

  async function action(method, ...args) {
    try {
      const result = await ticketService[method](...args);
      await reload();
      return result;
    } catch (e) {
      setNotice(e.message || 'Something went wrong. Please try again.');
      throw e;
    }
  }

  return (
    <Context.Provider
      value={{ tickets, loading, error, reload, notice, setNotice, action }}
    >
      {children}
    </Context.Provider>
  );
}

export const useTickets = () => useContext(Context);
