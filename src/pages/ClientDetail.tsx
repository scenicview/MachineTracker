import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import InfoRow from '../components/InfoRow';
import { formatHours } from '../utils/formatters';
import { useState } from 'react';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clientId = Number(id);
  const [showDelete, setShowDelete] = useState(false);

  const client = useLiveQuery(() => db.clients.get(clientId), [clientId]);
  const equipment = useLiveQuery(
    () => db.equipment.where('clientId').equals(clientId).sortBy('modelNumber'),
    [clientId]
  );

  if (!client) return null;

  async function handleDelete() {
    await db.serviceRecords
      .where('equipmentId')
      .anyOf((await db.equipment.where('clientId').equals(clientId).primaryKeys()))
      .delete();
    await db.equipment.where('clientId').equals(clientId).delete();
    await db.clients.delete(clientId);
    navigate('/clients', { replace: true });
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/clients')}>← Back</button>
        <h1>{client.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate(`/clients/${clientId}/edit`)}>Edit</button>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Contact Info</div>
        {client.phone && <InfoRow label="Phone" value={client.phone} />}
        {client.email && <InfoRow label="Email" value={client.email} />}
        {client.address && <InfoRow label="Address" value={client.address} />}
        {!client.phone && !client.email && !client.address && (
          <p className="text-muted" style={{ padding: 16 }}>No contact info</p>
        )}
      </div>

      {client.notes && (
        <div className="card">
          <div className="card-header">Notes</div>
          <p style={{ padding: 16, margin: 0, whiteSpace: 'pre-wrap' }}>{client.notes}</p>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span>Equipment ({equipment?.length ?? 0})</span>
          <button className="btn-small" onClick={() => navigate(`/equipment/new?clientId=${clientId}`)}>
            + Add
          </button>
        </div>
        {equipment && equipment.length > 0 ? (
          <div className="list">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className="list-item"
                onClick={() => navigate(`/equipment/${eq.id}`)}
              >
                <div className="list-item-content">
                  <div className="list-item-title">{eq.modelNumber}</div>
                  <div className="list-item-subtitle">S/N: {eq.serialNumber}</div>
                  <div className="list-item-meta">{formatHours(eq.currentHourMeter)} hrs</div>
                </div>
                <span className="list-item-chevron">›</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ padding: 16 }}>No equipment yet</p>
        )}
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Client?</h3>
            <p>This will also delete all equipment and service records for {client.name}.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
