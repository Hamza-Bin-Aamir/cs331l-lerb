import React from 'react';
import { useBooking } from '../context/BookingContext';
import '../App.css';
import { NavLink } from 'react-router-dom';

export const ResourcesPage = () => {
  const { resources, bookNow, currentUser } = useBooking();
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams(window.location.search));
  // keep local searchParams in sync with URL (listen to history changes)
  React.useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
    const onPop = () => setSearchParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const categoryFilter = searchParams.get('category') || '';
  const onlyAvailable = searchParams.get('available') === '1';

  const filtered = resources.filter((r) => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (onlyAvailable && r.bookedBy) return false;
    return true;
  });

  return (
    <div className="page">
      <h2>Equipment & Resources</h2>

      <div style={{ marginBottom: 12 }}>
        <strong>Filters:</strong>{' '}
        <NavLink to="/resources">All</NavLink>{' '}
        <NavLink to="/resources?category=Electronics" style={{ marginLeft: 8 }}>
          Electronics
        </NavLink>
        <NavLink to="/resources?category=Room" style={{ marginLeft: 8 }}>
          Room
        </NavLink>
        <button
          className="btn"
          style={{ marginLeft: 8 }}
          onClick={() => {
            const p = new URLSearchParams();
            p.set('available', '1');
            setSearchParams(p);
            window.history.pushState(null, '', `/resources?${p.toString()}`);
          }}
        >
          Only Available
        </button>
        <button
          className="btn"
          style={{ marginLeft: 8 }}
          onClick={() => {
            const p = new URLSearchParams();
            setSearchParams(p);
            window.history.pushState(null, '', '/resources');
          }}
        >
          Clear
        </button>
      </div>

      <div className="card-grid">
        {filtered.map((r) => {
          const isAvailable = !r.bookedBy;
          const isMine = r.bookedBy === currentUser;
          const statusText = isAvailable ? 'Available' : `Booked by ${r.bookedBy}`;
          return (
            <div key={r.id} className="card">
              <div className="card-title">
                <span style={{ marginRight: 8 }} aria-hidden>
                  {r.emoji}
                </span>
                <NavLink to={`/resources/${r.id}`}>{r.name}</NavLink>
              </div>
              <div className={`status ${isAvailable ? 'status-green' : 'status-red'}`}>{statusText}</div>
              <button
                className="btn"
                onClick={() => bookNow(r.id)}
                disabled={!isAvailable}
                aria-disabled={!isAvailable}
              >
                {isAvailable ? 'Book Now' : isMine ? 'Booked' : 'Unavailable'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
