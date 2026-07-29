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

/** The 4 installation stages a site can be in. */
export type SiteStage = 'برج' | 'باب وعمود' | 'ماكينة وكابينة' | 'كهرباء';

/** Per-day money adjustment on a schedule / attendance row. */
export type AdjustType = 'إضافي' | 'خصم' | 'لا يوجد';

export interface Site {
  id: string;
  siteNumber: string;
  siteName: string;
  address: string;
  mapUrl: string;
  startDate: string;
  endDate: string;
  totalDays: number;      // auto = differenceInDays(end, start)
  price: number;          // السعر الكلي — جنيه
  elevatorCount: number;  // عدد المصاعد
  elevatorType: string;   // نوع المصاعد — free text typed by the manager
  stopPrice: number;      // سعر الوقفة
  stopsCount: number;     // عدد الوقفات
  stagePrice: number;     // سعر المرحلة
  stagesCount: number;    // عدد المراحل
  customerType: 'شركة' | 'عميل';
  currentStage: SiteStage;
  createdAt: string;
}

export interface SiteSchedule {
  id: string;
  siteId: string;
  day: string;
  date: string;
  stageType: SiteStage | '';   // نوع المرحلة لليوم
  tech1Id: string;
  tech2Id: string;
  worker1Id: string;
  worker2Id: string;
  accomplished: string;        // ما تم إنجازه
  notes1: string;              // الملاحظات — 3 أعمدة
  notes2: string;
  notes3: string;
  notes?: string;              // legacy single-notes field (pre-migration records)
  adjustType: AdjustType;      // إضافي | خصم | لا يوجد
  bonusValue: number;
  bonusReason: string;
  deductionValue: number;
  deductionReason: string;
}

/** The 4 worker roles (نوع الموظف). */
export type WorkerRole = 'مهندس' | 'فني' | 'مساعد' | 'مساعد أول';

/** Salary basis (نوع الراتب). */
export type SalaryType = 'يومية' | 'راتب شهري';

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  salaryType: SalaryType;
  baseSalary: number;      // قيمة الراتب — جنيه
  joinDate: string;
  notes: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  day: string;
  date: string;
  status: 'present' | 'absent';
  location: string;            // مكان العمل — من المواقع/العروض
  adjustType: AdjustType;      // إضافي | خصم | لا يوجد
  bonusValue: number;
  bonusReason: string;
  deductionValue: number;
  deductionReason: string;
}

export interface User {
  email: string;
  role: 'admin';
}
