import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import EmptyState from '../components/EmptyState';
import { useState } from 'react';

export default function ClientList() {
  const navigate = useNavigate();
  const clients = useLiveQuery(() => db.clients.orderBy('name').toArray());
  const [search, setSearch] = useState('');

  if (!clients) return null;

  const filtered = search
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clients</h1>
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          + Add
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState icon="👤" message="No clients yet. Tap + Add to get started." />
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="list">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="list-item"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="list-item-content">
                  <div className="list-item-title">{client.name}</div>
                  {client.phone && (
                    <div className="list-item-subtitle">{client.phone}</div>
                  )}
                </div>
                <span className="list-item-chevron">›</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
