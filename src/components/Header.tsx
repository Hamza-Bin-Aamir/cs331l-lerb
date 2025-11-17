import React from 'react';
import { NavLink } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './Header.css';

export const Header = () => {
  const { currentUser, setCurrentUser, availableUsers } = useBooking();

  return (
    <header className="Header-root">
      <div className="Header-container">
        <div className="Header-brand">LERB</div>

        <nav className="Header-nav" aria-label="Main navigation">
          <NavLink to="/resources" className={({ isActive }: any) => (isActive ? 'Header-link active' : 'Header-link')}>
            Resources
          </NavLink>
          <NavLink to="/my-bookings" className={({ isActive }: any) => (isActive ? 'Header-link active' : 'Header-link')}>
            My Bookings
          </NavLink>
        </nav>

        <div className="Header-user">
          <span className="Header-user-label">Logged in as</span>
          <select
            aria-label="Select user"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            className="Header-select"
          >
            {availableUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
