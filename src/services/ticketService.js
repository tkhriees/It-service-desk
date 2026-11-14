import { initialTickets } from '../data/mockData.js';
// Replace these methods with fetch calls to API_URL when your API is ready.
export const API_URL = import.meta.env?.VITE_API_URL || '';
const KEY = 'campusdesk-tickets-v1';
function read() { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : structuredClone(initialTickets); }
function save(tickets) { localStorage.setItem(KEY, JSON.stringify(tickets)); return tickets; }
export const ticketService = {
  async list() { return read(); },
  async create(fields) { const tickets = read(); const date = new Date().toISOString(); const ticket = { ...fields, id: `HD-${Math.max(1048,...tickets.map(t => Number(t.id.slice(3))))+1}`, createdAt: date, status: 'Open', assignedTo: '', replies: [], activity: [{ text: 'Ticket submitted', date }] }; save([ticket,...tickets]); return ticket; },
  async update(id, changes, message) { const tickets = read(); const ticket = tickets.find(t => t.id === id); if (!ticket) throw new Error('Ticket could not be found.'); Object.assign(ticket,changes); if(message) ticket.activity.push({ text: message, date: new Date().toISOString() }); save(tickets); return ticket; },
  async reply(id, body, author) { const tickets = read(); const ticket = tickets.find(t => t.id === id); if (!ticket) throw new Error('Ticket could not be found.'); ticket.replies.push({ id: crypto.randomUUID(), body, author, date: new Date().toISOString() }); ticket.activity.push({ text: `${author} added a reply`, date: new Date().toISOString() }); save(tickets); return ticket; }
};
