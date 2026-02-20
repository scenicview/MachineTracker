export type ServiceType = '250hr' | '1000hr';

export interface Client {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCategory {
  id?: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Equipment {
  id?: number;
  modelNumber: string;
  serialNumber: string;
  currentHourMeter: number;
  year: number;
  location: string;
  notes: string;
  photoUri: string | null;
  clientId: number;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id?: number;
  serviceType: ServiceType;
  datePerformed: string;
  hourMeterReading: number;
  workDescription: string;
  equipmentId: number;
  createdAt: string;
  updatedAt: string;
}
