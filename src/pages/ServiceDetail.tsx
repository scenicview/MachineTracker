import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import InfoRow from '../components/InfoRow';
import ServiceTypeBadge from '../components/ServiceTypeBadge';
import { formatDate, formatHours } from '../utils/formatters';
import { useState } from 'react';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recId = Number(id);
  const [showDelete, setShowDelete] = useState(false);

  const record = useLiveQuery(() => db.serviceRecords.get(recId), [recId]);
  const equipment = useLiveQuery(
    () => (record ? db.equipment.get(record.equipmentId) : undefined),
    [record]
  );
  const client = useLiveQuery(
    () => (equipment ? db.clients.get(equipment.clientId) : undefined),
    [equipment]
  );

  if (!record) return null;

  async function handleDelete() {
    await db.serviceRecords.delete(recId);
    navigate(-1);
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>Service Record</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate(`/services/${recId}/edit`)}>Edit</button>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Service Info</div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 15 }}>Type</span>
          <ServiceTypeBadge type={record.serviceType} />
        </div>
        <InfoRow label="Date" value={formatDate(record.datePerformed)} />
        <InfoRow label="Hour Meter" value={`${formatHours(record.hourMeterReading)} hrs`} />
      </div>

      <div className="card">
        <div className="card-header">Work Description</div>
        <p style={{ padding: 16, margin: 0, whiteSpace: 'pre-wrap' }}>
          {record.workDescription || 'No description provided'}
        </p>
      </div>

      {equipment && (
        <div className="card">
          <div className="card-header">Equipment</div>
          <div
            className="list-item"
            onClick={() => navigate(`/equipment/${equipment.id}`)}
          >
            <div className="list-item-content">
              <div className="list-item-title">{equipment.modelNumber}</div>
              <div className="list-item-subtitle">S/N: {equipment.serialNumber}</div>
              {client && <div className="list-item-meta">Client: {client.name}</div>}
            </div>
            <span className="list-item-chevron">›</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Record Info</div>
        <InfoRow label="Created" value={formatDate(record.createdAt)} />
        <InfoRow label="Updated" value={formatDate(record.updatedAt)} />
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Service Record?</h3>
            <p>This service record will be permanently deleted.</p>
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
