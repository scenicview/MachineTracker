import Dexie, { type Table } from 'dexie';
import type { Client, Equipment, ServiceRecord, EquipmentCategory } from '../types';

class MachineTrackerDB extends Dexie {
  clients!: Table<Client>;
  equipment!: Table<Equipment>;
  serviceRecords!: Table<ServiceRecord>;
  categories!: Table<EquipmentCategory>;

  constructor() {
    super('MachineTrackerDB');
    this.version(1).stores({
      clients: '++id, name',
      equipment: '++id, modelNumber, serialNumber, clientId, categoryId',
      serviceRecords: '++id, serviceType, equipmentId, datePerformed',
      categories: '++id, name',
    });
  }
}

export const db = new MachineTrackerDB();

export async function seedDefaultCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    const defaults = [
      'Excavator', 'Loader', 'Dozer', 'Skid Steer', 'Crane',
      'Generator', 'Compressor', 'Truck', 'Trailer', 'Other',
    ];
    const now = new Date().toISOString();
    await db.categories.bulkAdd(
      defaults.map((name) => ({ name, isDefault: true, createdAt: now }))
    );
  }
}
