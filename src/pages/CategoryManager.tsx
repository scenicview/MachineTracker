import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { nowISO } from '../utils/formatters';
import { useState } from 'react';

export default function CategoryManager() {
  const navigate = useNavigate();
  const categories = useLiveQuery(() => db.categories.orderBy('name').toArray());
  const equipmentCounts = useLiveQuery(async () => {
    const counts: Record<number, number> = {};
    const all = await db.equipment.toArray();
    for (const eq of all) {
      if (eq.categoryId) {
        counts[eq.categoryId] = (counts[eq.categoryId] || 0) + 1;
      }
    }
    return counts;
  });

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  if (!categories || !equipmentCounts) return null;

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    await db.categories.add({ name, isDefault: false, createdAt: nowISO() });
    setNewName('');
  }

  async function saveEdit(id: number) {
    const name = editName.trim();
    if (!name) return;
    await db.categories.update(id, { name });
    setEditingId(null);
  }

  async function deleteCategory(id: number) {
    await db.categories.delete(id);
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>Categories</h1>
      </div>

      <div className="card">
        <div className="card-header">Add New Category</div>
        <div style={{ display: 'flex', padding: 16, gap: 8 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button className="btn-primary" onClick={addCategory} disabled={!newName.trim()}>
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Categories</div>
        <div className="list">
          {categories.map((cat) => (
            <div key={cat.id} className="list-item" style={{ cursor: 'default' }}>
              {editingId === cat.id ? (
                <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id!)}
                    autoFocus
                  />
                  <button className="btn-small" onClick={() => saveEdit(cat.id!)}>Save</button>
                  <button className="btn-small" onClick={() => setEditingId(null)} style={{ color: '#888' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{cat.name}</span>
                    {cat.isDefault && (
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 8, backgroundColor: '#f0f0f0', color: '#888' }}>
                        Default
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      {equipmentCounts[cat.id!] || 0}
                    </span>
                    <button
                      className="btn-small"
                      onClick={() => { setEditingId(cat.id!); setEditName(cat.name); }}
                    >
                      Edit
                    </button>
                    {(equipmentCounts[cat.id!] || 0) === 0 && (
                      <button
                        className="btn-danger-small"
                        onClick={() => deleteCategory(cat.id!)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
