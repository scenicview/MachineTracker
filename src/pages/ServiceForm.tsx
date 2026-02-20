import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { db } from '../db/database';
import { nowISO, todayString, formatHours } from '../utils/formatters';
import { useEffect, useState } from 'react';
import type { ServiceType } from '../types';

export default function ServiceForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  const recId = isEditing ? Number(id) : null;
  const preselectedEquipmentId = searchParams.get('equipmentId');

  const [serviceType, setServiceType] = useState<ServiceType>('250hr');
  const [datePerformed, setDatePerformed] = useState(todayString());
  const [hourMeterReading, setHourMeterReading] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [equipmentId, setEquipmentId] = useState<number | null>(null);

  const equipment = useLiveQuery(() => db.equipment.get(equipmentId ?? 0), [equipmentId]);

  useEffect(() => {
    if (recId) {
      db.serviceRecords.get(recId).then((rec) => {
        if (rec) {
          setServiceType(rec.serviceType);
          setDatePerformed(rec.datePerformed);
          setHourMeterReading(String(rec.hourMeterReading));
          setWorkDescription(rec.workDescription);
          setEquipmentId(rec.equipmentId);
        }
      });
    } else if (preselectedEquipmentId) {
      const eqId = Number(preselectedEquipmentId);
      setEquipmentId(eqId);
      // Pre-fill hour meter from equipment
      db.equipment.get(eqId).then((eq) => {
        if (eq && eq.currentHourMeter > 0) {
          setHourMeterReading(formatHours(eq.currentHourMeter));
        }
      });
    }
  }, [recId, preselectedEquipmentId]);

  const isValid = hourMeterReading && parseFloat(hourMeterReading) > 0 && equipmentId;

  async function handleSave() {
    if (!isValid || !equipmentId) return;

    const hours = parseFloat(hourMeterReading) || 0;
    const now = nowISO();

    if (recId) {
      await db.serviceRecords.update(recId, {
        serviceType,
        datePerformed,
        hourMeterReading: hours,
        workDescription,
        updatedAt: now,
      });
      // Auto-update equipment hour meter
      const eq = await db.equipment.get(equipmentId);
      if (eq && hours > eq.currentHourMeter) {
        await db.equipment.update(equipmentId, { currentHourMeter: hours, updatedAt: now });
      }
      navigate(`/services/${recId}`, { replace: true });
    } else {
      const newId = await db.serviceRecords.add({
        serviceType,
        datePerformed,
        hourMeterReading: hours,
        workDescription,
        equipmentId,
        createdAt: now,
        updatedAt: now,
      });
      // Auto-update equipment hour meter
      const eq = await db.equipment.get(equipmentId);
      if (eq && hours > eq.currentHourMeter) {
        await db.equipment.update(equipmentId, { currentHourMeter: hours, updatedAt: now });
      }
      navigate(`/services/${newId}`, { replace: true });
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Cancel</button>
        <h1>{isEditing ? 'Edit Service' : 'New Service'}</h1>
        <button className="btn-primary" onClick={handleSave} disabled={!isValid}>Save</button>
      </div>

      <div className="form-card">
        <div className="form-section-title">Service Type</div>
        <div style={{ display: 'flex', gap: 0, padding: '0 16px 16px' }}>
          <button
            className={`segment-btn ${serviceType === '250hr' ? 'segment-active' : ''}`}
            onClick={() => setServiceType('250hr')}
            style={{ borderRadius: '8px 0 0 8px' }}
          >
            250-Hour Service
          </button>
          <button
            className={`segment-btn ${serviceType === '1000hr' ? 'segment-active' : ''}`}
            onClick={() => setServiceType('1000hr')}
            style={{ borderRadius: '0 8px 8px 0' }}
          >
            1000-Hour Service
          </button>
        </div>

        <div className="form-section-title">Service Details</div>
        <label className="form-field">
          <span>Date Performed</span>
          <input type="date" value={datePerformed} onChange={(e) => setDatePerformed(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Hour Meter Reading *</span>
          <input
            type="number"
            step="0.1"
            value={hourMeterReading}
            onChange={(e) => setHourMeterReading(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
          />
        </label>

        <div className="form-section-title">Work Description</div>
        <label className="form-field">
          <textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder="Describe the work performed..."
            rows={6}
          />
        </label>

        {equipment && (
          <>
            <div className="form-section-title">Equipment Reference</div>
            <div style={{ padding: '8px 16px 16px' }}>
              <div style={{ fontWeight: 600 }}>{equipment.modelNumber}</div>
              <div className="text-muted" style={{ fontSize: 14 }}>S/N: {equipment.serialNumber}</div>
              <div className="text-muted" style={{ fontSize: 14 }}>Current Hours: {formatHours(equipment.currentHourMeter)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
