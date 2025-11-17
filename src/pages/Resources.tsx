import React from 'react';
import { useBooking } from '../context/BookingContext';
import '../App.css';
import { NavLink } from 'react-router-dom';
import { Resource } from '../types';

export const ResourcesPage = () => {
  const { resources, bookNow, currentUser, createResource, fetchResources, updateResource, deleteResource } = useBooking();

  // Use window.location and a small "locationchange" shim so we don't depend
  // on react-router hooks (some projects have typing mismatches). This watches
  // for URL/search changes and re-fetches resources from backend accordingly.
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams(window.location.search));

  React.useEffect(() => {
    // shim: dispatch 'locationchange' event when pushState/replaceState are called
    const _wr = (type: 'pushState' | 'replaceState') => {
      const orig = (window.history as any)[type];
      return function (this: any) {
        const rv = orig.apply(this, arguments as any);
        const ev = new Event('locationchange');
        window.dispatchEvent(ev);
        return rv;
      };
    };

    (window.history as any).pushState = _wr('pushState');
    (window.history as any).replaceState = _wr('replaceState');

    const onLoc = () => {
      const p = new URLSearchParams(window.location.search);
      setSearchParams(p);
      // ask context to fetch current filtered resources
      fetchResources(window.location.search).catch(() => {});
    };

    window.addEventListener('popstate', onLoc);
    window.addEventListener('locationchange', onLoc);

  // initial load: ensure resources reflect any query in the URL
  fetchResources(window.location.search).catch(() => {});

    return () => {
      // restore listeners - note: we don't restore pushState/replaceState originals
      // to keep the shim simple in this small app. If needed, store originals and restore here.
      window.removeEventListener('popstate', onLoc);
      window.removeEventListener('locationchange', onLoc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResources]);

  // derive available categories from current resources for the create form dropdown
  const categories = React.useMemo((): string[] => {
    const set = new Set<string>();
    (resources || []).forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [resources]);

  // local UI state to handle editing
  const [editingId, setEditingId] = React.useState(null as string | null);
  const [editValues, setEditValues] = React.useState({} as {
    name?: string;
    emoji?: string;
    category?: string;
  });

  return (
    <div className="page">
      <h2>Equipment & Resources</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as any;
          const id = form.elements.id.value.trim();
          const name = form.elements.name.value.trim();
          const emoji = form.elements.emoji.value.trim();
          const category = form.elements.category.value.trim() || undefined;
          if (!id || !name || !emoji) return;
          const created = await createResource({ id, name, emoji, category });
            if (created) {
              // trigger page-level re-fetch so current filters are applied
              window.history.pushState(null, '', window.location.href);
              window.dispatchEvent(new Event('locationchange'));
              form.reset();
            }
        }}
        style={{ marginBottom: 12 }}
      >
        <strong>Add resource:</strong>{' '}
        <input name="id" placeholder="id" style={{ marginLeft: 8 }} />
        <input name="name" placeholder="name" style={{ marginLeft: 8 }} />
        <input name="emoji" placeholder="emoji" style={{ marginLeft: 8 }} />
        <select name="category" style={{ marginLeft: 8 }} defaultValue={''}>
          <option value="">(none)</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn" type="submit" style={{ marginLeft: 8 }}>
          Create
        </button>
      </form>

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
            // push a new URL and trigger our locationchange shim
            window.history.pushState(null, '', `/resources?${p.toString()}`);
            window.dispatchEvent(new Event('locationchange'));
          }}
        >
          Only Available
        </button>
        <button
          className="btn"
          style={{ marginLeft: 8 }}
          onClick={() => {
            // clear filters
            window.history.pushState(null, '', '/resources');
            window.dispatchEvent(new Event('locationchange'));
          }}
        >
          Clear
        </button>
      </div>
      <div className="card-grid">
    {(resources || []).map((r: Resource) => {
          const isAvailable = !r.bookedBy;
          const isMine = r.bookedBy === currentUser;
          const statusText = isAvailable ? 'Available' : `Booked by ${r.bookedBy}`;
          return (
            <div key={r.id} className="card">
              <div className="card-title">
                <span style={{ marginRight: 8 }} aria-hidden>
                  {r.emoji}
                </span>
                {!editingId || editingId !== r.id ? (
                  <NavLink to={`/resources/${r.id}`}>{r.name}</NavLink>
                ) : (
                  <input
                    value={editValues.name ?? r.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  />
                )}
              </div>
              <div className={`status ${isAvailable ? 'status-green' : 'status-red'}`}>{statusText}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  onClick={async () => {
                    const ok = await bookNow(r.id);
                    if (ok) {
                      // refresh filtered list after successful booking
                      await fetchResources(window.location.search);
                    }
                  }}
                  disabled={!isAvailable}
                  aria-disabled={!isAvailable}
                >
                  {isAvailable ? 'Book Now' : isMine ? 'Booked' : 'Unavailable'}
                </button>

                {!editingId || editingId !== r.id ? (
                  <>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingId(r.id);
                        setEditValues({ name: r.name, emoji: r.emoji, category: r.category });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      onClick={async () => {
                        if (!window.confirm(`Delete resource ${r.name}?`)) return;
                        await deleteResource(r.id);
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      value={editValues.emoji ?? r.emoji}
                      onChange={(e) => setEditValues({ ...editValues, emoji: e.target.value })}
                      style={{ width: 48 }}
                    />
                    <select
                      value={editValues.category ?? r.category ?? ''}
                      onChange={(e) => setEditValues({ ...editValues, category: e.target.value || undefined })}
                    >
                      <option value="">(none)</option>
                      {categories.map((c: string) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn"
                      onClick={async () => {
                        const ok = await updateResource(r.id, {
                          name: editValues.name,
                          emoji: editValues.emoji,
                          category: editValues.category,
                        });
                        if (ok) {
                          setEditingId(null);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingId(null);
                        setEditValues({});
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
