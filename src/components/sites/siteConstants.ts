import { differenceInDays } from 'date-fns';
import { Site, SiteStage, AdjustType } from '../../types';

/** The installation stages (المرحلة الحالية للموقع / مرحلة اليوم في الجدول). */
export const SITE_STAGES: SiteStage[] = [
  'برج',
  'باب وعمود',
  'ماكينة وكابينة',
  'كهرباء',
  'باب وعمود وبرج',
  'باب وعمود وكمر',
  'مصعد كامل',
];

/** Customer types (نوع العميل). */
export const CUSTOMER_TYPES: Site['customerType'][] = ['عميل', 'شركة'];

/** Per-day money adjustment options. */
export const ADJUST_TYPES: AdjustType[] = ['لا يوجد', 'إضافي', 'خصم'];

/** Which worker roles fill the "technician" slots vs the "worker" slots on the daily log. */
export const TECH_ROLES = ['مهندس', 'فني'];
export const WORKER_ROLES = ['مساعد', 'مساعد أول'];

export const SITE_SEARCH_TYPES = [
  { label: 'اسم الموقع', key: 'siteName'   },
  { label: 'رقم الموقع', key: 'siteNumber' },
  { label: 'العنوان',    key: 'address'    },
] as const;

export const SITE_PDF_COLUMNS = [
  { header: 'رقم الموقع',   dataKey: 'siteNumber'   },
  { header: 'اسم الموقع',   dataKey: 'siteName'     },
  { header: 'العنوان',      dataKey: 'address'      },
  { header: 'تاريخ البداية', dataKey: 'startDate'   },
  { header: 'تاريخ النهاية', dataKey: 'endDate'     },
  { header: 'أيام العمل',   dataKey: 'totalDays'    },
  { header: 'السعر',        dataKey: 'price'        },
] as const;

/**
 * Auto-calculates total working days between two dates (inclusive of the range span).
 * Mirrors calcEndDate in maintenanceConstants.ts. Returns 0 for invalid/empty input.
 */
export const calcTotalDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const days = differenceInDays(new Date(endDate), new Date(startDate));
  return days > 0 ? days : 0;
};
