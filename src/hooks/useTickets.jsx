import { createContext, useContext, useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
const Context = createContext();
export function TicketProvider({ children }) {
 const [tickets,setTickets] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState(''), [notice,setNotice] = useState('');
 async function reload() { setLoading(true); setError(''); try {setTickets(await ticketService.list());} catch {setError('We couldn’t load your tickets. Check that browser storage is available, then try again.');} finally {setLoading(false);} }
 useEffect(() => {reload();},[]);
 useEffect(() => { if(notice) {const id = setTimeout(()=>setNotice(''),4500); return ()=>clearTimeout(id);} },[notice]);
 async function action(method,...args) { try { const result = await ticketService[method](...args); setTickets(await ticketService.list()); return result; } catch(e) {setNotice(e.message || 'Something went wrong. Please try again.'); throw e;} }
 return <Context.Provider value={{tickets,loading,error,reload,notice,setNotice,action}}>{children}</Context.Provider>;
}
export const useTickets = () => useContext(Context);
