import React from 'react';
import { useBooking } from '../context/BookingContext';

export const ResourceDetailPage = () => {
  // derive resource id from the current path (avoid react-router hooks typing issues)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const resourceId = pathParts[pathParts.length - 1];

  const { resources, bookNow, currentUser } = useBooking();

  // If resources haven't loaded yet, show a loading state. This avoids
  // immediately showing "not found" while the context fetch is in progress.
  if (!resources || resources.length === 0) {
    return (
      <div className="page">
        <h2>Loading...</h2>
      </div>
    );
  }

  const resource = resources.find((r) => r.id === resourceId);

  if (!resource) {
    return (
      <div className="page">
        <h2>Resource not found</h2>
        <button
          className="btn"
          onClick={() => {
            window.history.pushState(null, '', '/resources');
            window.dispatchEvent(new Event('locationchange'));
          }}
        >
          Back to resources
        </button>
      </div>
    );
  }

  const isAvailable = !resource.bookedBy;

  const handleBook = async () => {
    const ok = await bookNow(resource.id);
    if (ok) {
      window.location.assign('/my-bookings');
    }
  };

  return (
    <div className="page">
      <h2>
        <span aria-hidden style={{ marginRight: 8 }}>
          {resource.emoji}
        </span>
        {resource.name}
      </h2>
      <div>Category: {resource.category || '—'}</div>
      <div>Status: {isAvailable ? 'Available' : `Booked by ${resource.bookedBy}`}</div>
      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={handleBook} disabled={!isAvailable}>
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </button>
        <button
          className="btn"
          onClick={() => {
            window.history.pushState(null, '', '/resources');
            window.dispatchEvent(new Event('locationchange'));
          }}
          style={{ marginLeft: 8 }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
