import { getToken } from './storage';

const API_BASE = 'http://localhost:5000';

export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');

  const token = getToken();
  const fd = new FormData();
  fd.append('image', file);

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Upload failed');

  return data.url;
}

export default uploadImage;
