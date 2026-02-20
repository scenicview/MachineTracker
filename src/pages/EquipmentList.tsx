import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import EquipmentPhoto from '../components/EquipmentPhoto';
import { formatHours } from '../utils/formatters';
import { useState } from 'react';

export default function EquipmentList() {
  const navigate = useNavigate();
  const allEquipment = useLiveQuery(() => db.equipment.orderBy('modelNumber').toArray());
  const clients = useLiveQuery(() => db.clients.orderBy('name').toArray());
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray());

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<number | null>(null);

  if (!allEquipment || !clients || !categories) return null;

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let filtered = allEquipment;
  if (clientFilter !== null) {
    filtered = filtered.filter((e) => e.clientId === clientFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.modelNumber.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q)
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Equipment</h1>
        <button className="btn-primary" onClick={() => navigate('/equipment/new')}>
          + Add
        </button>
      </div>

      {allEquipment.length === 0 ? (
        <EmptyState icon="🔧" message="No equipment yet. Tap + Add to get started." />
      ) : (
        <>
          <div className="filter-bar">
            <FilterChip title="All" isSelected={clientFilter === null} onPress={() => setClientFilter(null)} />
            {clients.map((c) => (
              <FilterChip
                key={c.id}
                title={c.name}
                isSelected={clientFilter === c.id}
                onPress={() => setClientFilter(c.id!)}
              />
            ))}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search model or serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="list">
            {filtered.map((eq) => (
              <div
                key={eq.id}
                className="list-item"
                onClick={() => navigate(`/equipment/${eq.id}`)}
              >
                <EquipmentPhoto uri={eq.photoUri} size={50} />
                <div className="list-item-content" style={{ marginLeft: 12 }}>
                  <div className="list-item-title">{eq.modelNumber}</div>
                  <div className="list-item-subtitle">S/N: {eq.serialNumber}</div>
                  <div className="list-item-meta">
                    {clientMap[eq.clientId] ?? ''} · {formatHours(eq.currentHourMeter)} hrs
                    {eq.categoryId && categoryMap[eq.categoryId] ? ` · ${categoryMap[eq.categoryId]}` : ''}
                  </div>
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
