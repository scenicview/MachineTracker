import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import ServiceTypeBadge from '../components/ServiceTypeBadge';
import { formatDate, formatHours } from '../utils/formatters';
import { useState } from 'react';
import type { ServiceType } from '../types';

export default function ServiceList() {
  const navigate = useNavigate();
  const allRecords = useLiveQuery(() => db.serviceRecords.reverse().sortBy('datePerformed'));
  const allEquipment = useLiveQuery(() => db.equipment.toArray());
  const clients = useLiveQuery(() => db.clients.toArray());

  const [typeFilter, setTypeFilter] = useState<ServiceType | null>(null);
  const [search, setSearch] = useState('');

  if (!allRecords || !allEquipment || !clients) return null;

  const equipMap = Object.fromEntries(allEquipment.map((e) => [e.id, e]));
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  let filtered = allRecords;
  if (typeFilter) {
    filtered = filtered.filter((r) => r.serviceType === typeFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((r) => {
      const eq = equipMap[r.equipmentId];
      return (
        eq?.modelNumber.toLowerCase().includes(q) ||
        eq?.serialNumber.toLowerCase().includes(q) ||
        clientMap[eq?.clientId]?.toLowerCase().includes(q) ||
        r.workDescription.toLowerCase().includes(q)
      );
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Services</h1>
      </div>

      {allRecords.length === 0 ? (
        <EmptyState icon="📋" message="No service records yet. Add one from an equipment page." />
      ) : (
        <>
          <div className="filter-bar">
            <FilterChip title="All" isSelected={typeFilter === null} onPress={() => setTypeFilter(null)} />
            <FilterChip title="250 hr" isSelected={typeFilter === '250hr'} onPress={() => setTypeFilter('250hr')} />
            <FilterChip title="1000 hr" isSelected={typeFilter === '1000hr'} onPress={() => setTypeFilter('1000hr')} />
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search equipment, client, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="list">
            {filtered.map((rec) => {
              const eq = equipMap[rec.equipmentId];
              return (
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
                    {eq && (
                      <div className="list-item-subtitle" style={{ marginTop: 4 }}>
                        {eq.modelNumber} — S/N: {eq.serialNumber}
                      </div>
                    )}
                    <div className="list-item-meta">
                      {eq ? clientMap[eq.clientId] ?? '' : ''} · {formatHours(rec.hourMeterReading)} hrs
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
