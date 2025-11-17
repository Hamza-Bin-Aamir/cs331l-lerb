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
  createResource: (item: { id: string; name: string; emoji: string; category?: string }) => Promise<Resource | null>;
  fetchResources: (search?: string) => Promise<Resource[] | null>;
  updateResource: (resourceId: string, upd: { name?: string; emoji?: string; category?: string; bookedBy?: string | null }) => Promise<Resource | null>;
  deleteResource: (resourceId: string) => Promise<boolean>;
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
  // Centralized fetch method that can be called by pages to load filtered or all resources
  const fetchResources = React.useCallback(async (search?: string) => {
    try {
      const q = search || '';
      const res = await fetch(`${API_BASE}/resources${q}`);
      if (!res.ok) throw new Error(await res.text());
      const data: Resource[] = await res.json();
      setResources(data);
      return data;
    } catch (err) {
      // keep previous resources on error
      return null;
    }
  }, []);

  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Simulate a POST request that sends JSON body + headers and returns whether booking succeeded.
  const bookNow = async (resourceId: string) => {
  const body = JSON.stringify({ resource_id: resourceId, user: currentUser });
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
  await res.json();
  // refresh resources from server so any filters are preserved
  await fetchResources();
      notify('Booking confirmed');
      return true;
    } catch (err) {
      notify('Booking failed: ' + err);
      return false;
    }
  };

  // Create a new resource via backend POST /resources
  const createResource = async (item: { id: string; name: string; emoji: string; category?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(await res.text());
      const created: Resource = await res.json();
      // refresh full list after create
      await fetchResources();
      notify('Resource created');
      return created;
    } catch (err) {
      notify('Create resource failed: ' + err);
      return null;
    }
  };

  const updateResource = async (
    resourceId: string,
    upd: { name?: string; emoji?: string; category?: string; bookedBy?: string | null }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upd),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: Resource = await res.json();
      await fetchResources();
      notify('Resource updated');
      return updated;
    } catch (err) {
      notify('Update resource failed: ' + err);
      return null;
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
        method: 'DELETE',
      });
      if (res.status === 204) {
        await fetchResources();
        notify('Resource deleted');
        return true;
      }
      throw new Error(await res.text());
    } catch (err) {
      notify('Delete resource failed: ' + err);
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
    createResource,
    fetchResources,
    updateResource,
    deleteResource,
    setCurrentUser,
    availableUsers,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
