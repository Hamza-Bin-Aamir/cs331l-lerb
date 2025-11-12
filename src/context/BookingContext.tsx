import React from 'react';
import { Resource } from '../types';
import { initialResources } from '../data/resources';
import { useNotification } from './NotificationContext';

const API_BASE = 'http://localhost:8000';

type BookingContextValue = {
  currentUser: string;
  resources: Resource[];
  myBookings: Resource[];
  bookNow: (resourceId: string) => Promise<boolean>; // true if booked, false if blocked
  setCurrentUser: (user: string) => void;
  availableUsers: string[];
};

const BookingContext = React.createContext(undefined as unknown as BookingContextValue);

export const useBooking = (): BookingContextValue => {
  const ctx = React.useContext(BookingContext);
  return ctx;
};

type ProviderProps = { children?: any };

export const BookingProvider = ({ children }: ProviderProps) => {
  const [currentUser, setCurrentUser] = React.useState('Ali');
  const { notify } = useNotification();
  const [resources, setResources] = React.useState(initialResources as Resource[]);

  // Fetch resources from backend
  React.useEffect(() => {
    fetch(`${API_BASE}/resources`)
      .then((res) => res.json())
      .then((data) => setResources(data));
  }, []);

  // Simulate a POST request that sends JSON body + headers and returns whether booking succeeded.
  const bookNow = async (resourceId: string) => {
    const body = JSON.stringify({ resource_id: Number(resourceId), user: currentUser });
    const headers = {
      'Content-Type': 'application/json',
      'X-User': currentUser,
      'App-Version': '1.0.0',
    };
    try {
      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers,
        body,
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setResources((prev: Resource[]) => prev.map((r: Resource) => (r.id === updated.id ? updated : r)));
      notify('Booking confirmed');
      return true;
    } catch (err) {
      notify('Booking failed: ' + err);
      return false;
    }
  };

  const myBookings = React.useMemo(
    () => (resources as any[]).filter((r: any) => r.bookedBy === currentUser),
    [resources, currentUser]
  );

  const availableUsers = ['Ali', 'Fatima'];

  const value: BookingContextValue = {
    currentUser,
    resources,
    myBookings,
    bookNow,
    setCurrentUser,
    availableUsers,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
