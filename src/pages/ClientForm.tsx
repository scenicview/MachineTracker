import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import { nowISO } from '../utils/formatters';
import { useEffect, useState } from 'react';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  const clientId = isEditing ? Number(id) : null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientId) {
      db.clients.get(clientId).then((client) => {
        if (client) {
          setName(client.name);
          setPhone(client.phone);
          setEmail(client.email);
          setAddress(client.address);
          setNotes(client.notes);
        }
      });
    }
  }, [clientId]);

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const now = nowISO();
    if (clientId) {
      await db.clients.update(clientId, {
        name: trimmedName,
        phone,
        email,
        address,
        notes,
        updatedAt: now,
      });
      navigate(`/clients/${clientId}`, { replace: true });
    } else {
      const newId = await db.clients.add({
        name: trimmedName,
        phone,
        email,
        address,
        notes,
        createdAt: now,
        updatedAt: now,
      });
      navigate(`/clients/${newId}`, { replace: true });
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Cancel</button>
        <h1>{isEditing ? 'Edit Client' : 'New Client'}</h1>
        <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
          Save
        </button>
      </div>

      <div className="form-card">
        <div className="form-section-title">Client Info</div>
        <label className="form-field">
          <span>Name *</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
        </label>
        <label className="form-field">
          <span>Phone</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
        </label>
        <label className="form-field">
          <span>Address</span>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
        </label>

        <div className="form-section-title">Notes</div>
        <label className="form-field">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={4} />
        </label>
      </div>
    </div>
  );
}
