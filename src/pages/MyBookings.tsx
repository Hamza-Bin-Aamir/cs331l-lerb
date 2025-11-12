import React from 'react';
import { useBooking } from '../context/BookingContext';
import '../App.css';

export const MyBookingsPage = () => {
  const { myBookings } = useBooking();

  return (
    <div className="page">
      <h2>My Bookings</h2>
      {myBookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="card-grid">
          {myBookings.map((r) => (
            <div key={r.id} className="card">
              <div className="card-title">
                <span style={{ marginRight: 8 }} aria-hidden>
                  {r.emoji}
                </span>
                {r.name}
              </div>
              <div className="status status-red">Booked by You</div>
              <button className="btn" disabled aria-disabled>
                Booked
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
