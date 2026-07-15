import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tixflow-backend-bauggozpgq-as.a.run.app/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const eventApi = {
  getAll: (category) => API.get('/events', { params: { category } }),
  getById: (id) => API.get(`/events/${id}`),
  getSeats: (id) => API.get(`/events/${id}/seats`),
};

export const bookingApi = {
  initiate: (eventId, seatIds) => API.post('/bookings/initiate', { eventId, seatIds }),
  confirm: (id, paymentMethod = 'STRIPE') => API.post(`/bookings/${id}/confirm`, { paymentMethod }),
  createCheckoutSession: (id) => API.post(`/bookings/${id}/create-checkout-session`),
  cancel: (id) => API.post(`/bookings/${id}/cancel`),
  getMyBookings: () => API.get('/bookings/my'),
  getMy: () => API.get('/bookings/my'),
};

export const ticketApi = {
  getMyTickets: () => API.get('/tickets/my'),
  getByCode: (code) => API.get(`/tickets/${code}`),
  getDynamicQr: (code) => API.get(`/tickets/${code}/dynamic-qr`),
  transfer: (id, recipientEmail) => API.post(`/tickets/${id}/transfer`, { recipientEmail }),
};

export const queueApi = {
  join: (eventId) => API.post(`/queue/join/${eventId}`),
  getStatus: (eventId) => API.get(`/queue/status/${eventId}`),
};

export const organizerApi = {
  getAnalytics: (eventId) => API.get(`/organizer/analytics/${eventId}`),
  scanQr: (qrPayload) => API.post('/organizer/scan-qr', { qrPayload }),
};

export const adminApi = {
  createEvent: (data) => API.post('/admin/events', data),
  updateEvent: (id, data) => API.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => API.delete(`/admin/events/${id}`),
};

export default API;
