import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import InfoRow from '../components/InfoRow';
import EquipmentPhoto from '../components/EquipmentPhoto';
import ServiceTypeBadge from '../components/ServiceTypeBadge';
import { formatDate, formatHours } from '../utils/formatters';
import { useState } from 'react';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const equipId = Number(id);
  const [showDelete, setShowDelete] = useState(false);

  const equipment = useLiveQuery(() => db.equipment.get(equipId), [equipId]);
  const client = useLiveQuery(
    () => (equipment ? db.clients.get(equipment.clientId) : undefined),
    [equipment]
  );
  const category = useLiveQuery(
    () => (equipment?.categoryId ? db.categories.get(equipment.categoryId) : undefined),
    [equipment]
  );
  const records = useLiveQuery(
    () =>
      db.serviceRecords
        .where('equipmentId')
        .equals(equipId)
        .reverse()
        .sortBy('datePerformed'),
    [equipId]
  );

  if (!equipment) return null;

  async function handleDelete() {
    await db.serviceRecords.where('equipmentId').equals(equipId).delete();
    await db.equipment.delete(equipId);
    navigate(-1);
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>{equipment.modelNumber}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate(`/equipment/${equipId}/edit`)}>Edit</button>
          <button className="btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
        <EquipmentPhoto uri={equipment.photoUri} size={200} />
      </div>

      <div className="card">
        <div className="card-header">Equipment Info</div>
        <InfoRow label="Model" value={equipment.modelNumber} />
        <InfoRow label="Serial Number" value={equipment.serialNumber} />
        <InfoRow label="Hour Meter" value={`${formatHours(equipment.currentHourMeter)} hrs`} />
        {category && <InfoRow label="Category" value={category.name} />}
        {equipment.year > 0 && <InfoRow label="Year" value={String(equipment.year)} />}
        {equipment.location && <InfoRow label="Location" value={equipment.location} />}
        {client && <InfoRow label="Client" value={client.name} />}
      </div>

      {equipment.notes && (
        <div className="card">
          <div className="card-header">Notes</div>
          <p style={{ padding: 16, margin: 0, whiteSpace: 'pre-wrap' }}>{equipment.notes}</p>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span>Service History ({records?.length ?? 0})</span>
          <button className="btn-small" onClick={() => navigate(`/services/new?equipmentId=${equipId}`)}>
            + Add
          </button>
        </div>
        {records && records.length > 0 ? (
          <div className="list">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="list-item"
                onClick={() => navigate(`/services/${rec.id}`)}
              >
                <div className="list-item-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ServiceTypeBadge type={rec.serviceType} />
                    <span className="text-muted" style={{ fontSize: 13 }}>{formatDate(rec.datePerformed)}</span>
                  </div>
                  <div className="list-item-subtitle" style={{ marginTop: 4 }}>
                    {formatHours(rec.hourMeterReading)} hrs
                  </div>
                  {rec.workDescription && (
                    <div className="list-item-meta" style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {rec.workDescription}
                    </div>
                  )}
                </div>
                <span className="list-item-chevron">›</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted" style={{ padding: 16 }}>No service records yet</p>
        )}
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Equipment?</h3>
            <p>This will also delete all service records for this equipment.</p>
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
