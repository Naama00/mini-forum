import api from './api';
import createResourceService from './createResourceService';

export const eventService = createResourceService('/events', {
  attend: (id) => api.post(`/events/${id}/attend`),
  cancelAttendance: (id) => api.post(`/events/${id}/cancel-attendance`),
});

export default eventService;
