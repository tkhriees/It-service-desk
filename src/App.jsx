import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
export default function App() {
 const [user,setUser] = useState(() => {try{return JSON.parse(sessionStorage.getItem('campusdesk-user'));}catch{return null;}});
 function login(value) {
  sessionStorage.setItem('campusdesk-user', JSON.stringify(value));
  setUser(value);
  window.dispatchEvent(new Event('campusdesk-auth-changed'));
}
 function logout() {
  sessionStorage.removeItem('campusdesk-user');
  setUser(null);
  window.dispatchEvent(new Event('campusdesk-auth-changed'));
}
 const home = user?.role === 'staff' ? '/staff' : '/student';
 return <Routes><Route path="/login" element={user?<Navigate to={home}/>:<Login onLogin={login}/>}/><Route element={user?<Layout user={user} logout={logout}/>:<Navigate to="/login"/>}><Route path="/student" element={user?.role==='student'?<Dashboard user={user}/>:<Navigate to={home}/>}/><Route path="/student/tickets" element={user?.role==='student'?<Dashboard user={user} listOnly/>:<Navigate to={home}/>}/><Route path="/student/new" element={user?.role==='student'?<CreateTicket user={user}/>:<Navigate to={home}/>}/><Route path="/student/tickets/:id" element={<TicketDetails user={user}/>}/><Route path="/staff" element={user?.role==='staff'?<Dashboard user={user}/>:<Navigate to={home}/>}/><Route path="/staff/tickets/:id" element={user?.role==='staff'?<TicketDetails user={user}/>:<Navigate to={home}/>}/></Route><Route path="*" element={<Navigate to={user?home:'/login'}/>}/></Routes>;
}
