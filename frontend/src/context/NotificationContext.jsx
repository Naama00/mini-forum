import { createContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationContext = createContext();

/**
 * Notification Provider component
 */
export function NotificationProvider({ children }) {
  const notificationLogic = useNotifications();

  return (
    <NotificationContext.Provider value={notificationLogic}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
