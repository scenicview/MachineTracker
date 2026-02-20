import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { db } from '../db/database';
import { nowISO } from '../utils/formatters';
import EquipmentPhoto from '../components/EquipmentPhoto';
import { useEffect, useState, useRef } from 'react';

export default function EquipmentForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  const equipId = isEditing ? Number(id) : null;
  const preselectedClientId = searchParams.get('clientId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clients = useLiveQuery(() => db.clients.orderBy('name').toArray());
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray());

  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [currentHourMeter, setCurrentHourMeter] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (equipId) {
      db.equipment.get(equipId).then((eq) => {
        if (eq) {
          setModelNumber(eq.modelNumber);
          setSerialNumber(eq.serialNumber);
          setCurrentHourMeter(eq.currentHourMeter > 0 ? String(eq.currentHourMeter) : '');
          setYear(eq.year > 0 ? String(eq.year) : '');
          setLocation(eq.location);
          setNotes(eq.notes);
          setClientId(String(eq.clientId));
          setCategoryId(eq.categoryId ? String(eq.categoryId) : '');
          setPhotoUri(eq.photoUri);
        }
      });
    } else if (preselectedClientId) {
      setClientId(preselectedClientId);
    }
  }, [equipId, preselectedClientId]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const isValid = modelNumber.trim() && serialNumber.trim() && clientId;

  async function handleSave() {
    if (!isValid) return;

    const now = nowISO();
    const data = {
      modelNumber: modelNumber.trim(),
      serialNumber: serialNumber.trim(),
      currentHourMeter: parseFloat(currentHourMeter) || 0,
      year: parseInt(year) || 0,
      location,
      notes,
      photoUri,
      clientId: Number(clientId),
      categoryId: categoryId ? Number(categoryId) : null,
      updatedAt: now,
    };

    if (equipId) {
      await db.equipment.update(equipId, data);
      navigate(`/equipment/${equipId}`, { replace: true });
    } else {
      const newId = await db.equipment.add({
        ...data,
        createdAt: now,
      });
      navigate(`/equipment/${newId}`, { replace: true });
    }
  }

  if (!clients || !categories) return null;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Cancel</button>
        <h1>{isEditing ? 'Edit Equipment' : 'New Equipment'}</h1>
        <button className="btn-primary" onClick={handleSave} disabled={!isValid}>Save</button>
      </div>

      <div className="form-card">
        <div className="form-section-title">Equipment Info</div>
        <label className="form-field">
          <span>Model Number *</span>
          <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} autoCorrect="off" autoCapitalize="off" />
        </label>
        <label className="form-field">
          <span>Serial / Machine Number *</span>
          <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} autoCorrect="off" autoCapitalize="off" />
        </label>
        <label className="form-field">
          <span>Current Hour Meter</span>
          <input type="number" step="0.1" value={currentHourMeter} onChange={(e) => setCurrentHourMeter(e.target.value)} inputMode="decimal" />
        </label>
        <label className="form-field">
          <span>Year</span>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
        </label>
        <label className="form-field">
          <span>Location</span>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>

        <div className="form-section-title">Client *</div>
        <label className="form-field">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="form-section-title">
          <span>Category</span>
          <button className="btn-small" onClick={() => navigate('/categories')} type="button">Manage</button>
        </div>
        <label className="form-field">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="form-section-title">Photo</div>
        <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <EquipmentPhoto uri={photoUri} size={100} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
              Choose Photo
            </button>
            {photoUri && (
              <button className="btn-danger-small" onClick={() => { setPhotoUri(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                Remove
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        <div className="form-section-title">Notes</div>
        <label className="form-field">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={4} />
        </label>
      </div>
    </div>
  );
}
