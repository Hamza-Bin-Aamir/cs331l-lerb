import React from 'react';
import { NavLink } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const Header = () => {
  const { currentUser, setCurrentUser, availableUsers } = useBooking();

  const navStyle: any = {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  };

  return (
    <header className="App-header" style={{ minHeight: 'unset', padding: '12px 20px' }}>
      <nav style={navStyle}>
        <NavLink to="/resources" style={({ isActive }: any) => ({ color: isActive ? '#61dafb' : '#fff' })}>
          Resources
        </NavLink>
        <NavLink to="/my-bookings" style={({ isActive }: any) => ({ color: isActive ? '#61dafb' : '#fff' })}>
          My Bookings
        </NavLink>
      </nav>
      <div style={{ marginLeft: 'auto', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Logged in as</span>
        <select
          aria-label="Select user"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          style={{ padding: '4px 6px', borderRadius: 4 }}
        >
          {availableUsers.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
