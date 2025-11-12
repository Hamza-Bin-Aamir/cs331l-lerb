import React from 'react';

type NotificationContextValue = {
  notify: (message: string) => void;
};

const NotificationContext = React.createContext(undefined as unknown as NotificationContextValue);

export const useNotification = (): NotificationContextValue => {
  const ctx = React.useContext(NotificationContext);
  return ctx;
};

type ProviderProps = { children?: any };

export const NotificationProvider = ({ children }: ProviderProps) => {
  const [message, setMessage] = React.useState(null as string | null);

  const notify = React.useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: '#333',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          opacity: message ? 1 : 0,
          transition: 'opacity 200ms ease-in-out',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {message}
      </div>
    </NotificationContext.Provider>
  );
};
