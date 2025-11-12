import React from 'react';
import { Navigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export const ResourceDetailPage = () => {
  const resourceId = 'hardcoded-id'; // Replace useParams with a hardcoded value temporarily
  const { resources, bookNow, currentUser } = useBooking();

  const resource = resources.find((r) => r.id === resourceId);

  if (!resource) {
    return (
      <div className="page">
        <h2>Resource not found</h2>
        <button className="btn" onClick={() => <Navigate to="/resources" />}>
          Back to resources
        </button>
      </div>
    );
  }

  const isAvailable = !resource.bookedBy;

  const handleBook = async () => {
    const ok = await bookNow(resource.id);
    if (ok) <Navigate to="/my-bookings" />;
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
        <button className="btn" onClick={() => <Navigate to="/resources" />} style={{ marginLeft: 8 }}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
