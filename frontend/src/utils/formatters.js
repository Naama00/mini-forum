/**
 * Format time ago
 * @param {string} dateStr
 * @returns {string}
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `לפני ${days} ימים`;

  const months = Math.floor(days / 30);
  if (months < 12) return `לפני ${months} חודשים`;

  return new Date(dateStr).toLocaleDateString('he-IL');
};

/**
 * Format date to locale string
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('he-IL');
};

/**
 * Format date and time
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Generate avatar initials
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export const getAvatarInitials = (firstName = '', lastName = '') => {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Format number with thousand separators
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  return num?.toLocaleString('he-IL') || '0';
};

/**
 * Get color based on count
 * @param {number} count
 * @returns {string}
 */
export const getCountColor = (count) => {
  if (count < 5) return 'gray';
  if (count < 20) return 'blue';
  if (count < 50) return 'green';
  if (count < 100) return 'orange';
  return 'red';
};

export default {
  timeAgo,
  formatDate,
  formatDateTime,
  getAvatarInitials,
  truncateText,
  formatNumber,
  getCountColor,
};
