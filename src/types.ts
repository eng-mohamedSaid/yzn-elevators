export type ModuleType = 'offers' | 'maintenance' | 'sites' | 'workers' | 'attendance' | 'schedule';

export interface Offer {
  id: string;
  offerNumber: string;
  customerName: string;
  phone: string;
  address: string;
  locationUrl: string;
  date: string;
  customerType: 'عميل' | 'شركة';
  elevatorType: string;
  elevatorCount: number;
  stops: number;
  floors: number;
  entrances: number;
  load: string;
  machineType: string;
  controlBoard: string;
  battery: string;
  vvvf: string;
  payment1: number;
  payment2: number;
  payment3: number;
  payment4: number;
  doorType: string;
  innerDoor: string;
  doorSize: number;
  pitWidth: number;
  lastFloorHeight: number;
  pitDepth: number;
  pitLength: number;
  counterweightPosition: string;
  cabinSize: string;
  price: number;
  note1: string;
  note2: string;
  note3: string;
  representative: string;
  engNotes1: string;
  engNotes2: string;
  oldElevatorRemoval: 'يوجد' | 'لا يوجد';
  rails: string;
  createdAt: string;
}

export interface MaintenanceContract {
  id: string;
  maintenanceNumber: string;
  customerName: string;
  nationalId: string;
  phone: string;
  address: string;
  locationUrl: string;
  date: string;
  elevatorType: string;
  elevatorCount: number;
  floors: number;
  maintenanceStartDate: string;
  contractDuration: string;   // human label e.g. "سنة"
  endDate: string;            // auto-calculated on save
  price: number;
  notes: string;
  createdAt: string;
}

export interface Site {
  id: string;
  siteNumber: string;
  siteName: string;
  address: string;
  mapUrl: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  price: number;
  stagePrice: number;
  stagesCount: number;
  stopPrice: number;
  customerType: 'client' | 'company';
  createdAt: string;
}

export interface SiteSchedule {
  id: string;
  siteId: string;
  day: string;
  date: string;
  tech1Id: string;
  tech2Id: string;
  worker1Id: string;
  worker2Id: string;
  notes: string;
}

export interface Worker {
  id: string;
  name: string;
  joinDate: string;
  baseSalary: number;
  notes: string;
  role: 'tech' | 'worker';
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  day: string;
  date: string;
  status: 'present' | 'absent';
  location: string;
  bonus: number;
  deduction: number;
}

export interface User {
  email: string;
  role: 'admin';
}
