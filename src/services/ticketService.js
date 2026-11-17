export const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  try {
    const user = JSON.parse(sessionStorage.getItem('campusdesk-user'));
    return user?.token;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('Backend URL is not configured.');
  }

  const token = getToken();
  if (!token) {
    throw new Error('Please log in first.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

function formatTicket(ticket) {
  return {
    id: String(ticket.id),
    title: ticket.title,
    description: ticket.description || '',
    status: ticket.status === 'In Progress'
      ? 'In progress'
      : ticket.status,
    priority: ticket.priority || 'Medium',
    category: ticket.category || 'Other',
    createdAt: ticket.created_at,
    studentId: ticket.created_by_user_id,
    studentName: ticket.studentName || 'Student',
    assignedTo: ticket.assignedTo || '',
    attachments: [],
    replies: [],
    activity: []
  };
}

export const ticketService = {
  async list() {
    const data = await request('/api/tickets');
    return (data.tickets || []).map(formatTicket);
  },

  async create(fields) {
    const data = await request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: fields.title,
        description: fields.description
      })
    });

    return {
      id: String(data.ticketId),
      title: fields.title,
      description: fields.description,
      status: data.status || 'Open',
      priority: data.priority || 'Medium',
      category: 'Other',
      createdAt: new Date().toISOString(),
      studentId: fields.studentId,
      studentName: fields.studentName,
      assignedTo: '',
      attachments: [],
      replies: [],
      activity: []
    };
  },

  async update(id, changes) {
    if (changes.status !== undefined) {
      const status = changes.status === 'In progress'
        ? 'In Progress'
        : changes.status;

      return request(`/api/tickets/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }

    throw new Error('This update is not supported by the backend yet.');
  },

  async assign(id, userId) {
    return request(`/api/tickets/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async reply() {
    throw new Error('Ticket replies are not supported by the backend yet.');
  }
};
