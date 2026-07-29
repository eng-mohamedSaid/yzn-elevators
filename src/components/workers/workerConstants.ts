import { WorkerRole, SalaryType, AdjustType, Site, Offer } from '../../types';
import { dataService } from '../../services/dataService';

/** The 4 worker roles (نوع الموظف). */
export const WORKER_ROLES: WorkerRole[] = ['مهندس', 'فني', 'مساعد', 'مساعد أول'];

/** Salary basis options (نوع الراتب). */
export const SALARY_TYPES: SalaryType[] = ['يومية', 'راتب شهري'];

/** Attendance status labels. */
export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'حاضر' },
  { value: 'absent',  label: 'غائب' },
] as const;

/** Per-day money adjustment options. */
export const ADJUST_TYPES: AdjustType[] = ['لا يوجد', 'إضافي', 'خصم'];

export const WORKER_SEARCH_TYPES = [
  { label: 'الاسم',  key: 'name' },
  { label: 'الوظيفة', key: 'role' },
] as const;

export const WORKER_PDF_COLUMNS = [
  { header: 'اسم الموظف', dataKey: 'name'       },
  { header: 'الوظيفة',    dataKey: 'role'       },
  { header: 'نوع الراتب', dataKey: 'salaryType' },
  { header: 'الراتب',     dataKey: 'baseSalary' },
  { header: 'تاريخ الالتحاق', dataKey: 'joinDate' },
] as const;

/**
 * Builds the "مكان العمل" options for attendance, sourced from existing
 * Sites (siteName) + Offers (customerName / offerNumber). Spec:
 * "مكان العمل يتم اختياره من: المواقع، العروض".
 */
export const getWorkLocations = async (): Promise<string[]> => {
  const [sites, offers] = await Promise.all([
    dataService.getAll<Site>('sites'),
    dataService.getAll<Offer>('offers'),
  ]);

  const siteNames  = sites.map(s => s.siteName).filter(Boolean);
  const offerNames = offers.map(o =>
    o.offerNumber ? `${o.customerName} (${o.offerNumber})` : o.customerName
  ).filter(Boolean);

  // Distinct, sites first then offers.
  return Array.from(new Set([...siteNames, ...offerNames]));
};
