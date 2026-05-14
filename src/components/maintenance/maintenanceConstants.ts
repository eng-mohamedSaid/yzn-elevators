import { format, addMonths } from 'date-fns';

export const MAINTENANCE_ELEVATOR_TYPES = ['عادي', 'هايدروليك', 'جيرليس عادي', 'جيرليس اتوماتيك', 'وايدرامب', 'باكدج', 'طعام', 'بانوراما', 'بضاعة'];

export interface ContractDurationOption {
  label: string;
  months: number;
}

export const CONTRACT_DURATIONS: ContractDurationOption[] = [
  { label: 'شهر',        months: 1  },
  { label: 'شهرين',      months: 2  },
  { label: '3 أشهر',     months: 3  },
  { label: '6 أشهر',     months: 6  },
  { label: 'سنة',        months: 12 },
  { label: 'سنة ونصف',   months: 18 },
  { label: 'سنتين',      months: 24 },
  { label: '3 سنوات',    months: 36 },
];

export const CONTRACT_DURATION_LABELS = CONTRACT_DURATIONS.map(d => d.label);

/** Auto-calculates the contract end date from a start date + duration label */
export const calcEndDate = (startDate: string, durationLabel: string): string => {
  const dur = CONTRACT_DURATIONS.find(d => d.label === durationLabel);
  if (!dur || !startDate) return '';
  return format(addMonths(new Date(startDate), dur.months), 'yyyy-MM-dd');
};

export const MAINTENANCE_SEARCH_TYPES = [
  { label: 'الاسم',      key: 'customerName'       },
  { label: 'رقم العقد',  key: 'maintenanceNumber'  },
  { label: 'التليفون',   key: 'phone'              },
  { label: 'العنوان',    key: 'address'            },
] as const;

export const MAINTENANCE_PDF_COLUMNS = [
  { header: 'رقم العقد',     dataKey: 'maintenanceNumber' },
  { header: 'اسم العميل',    dataKey: 'customerName'      },
  { header: 'التليفون',      dataKey: 'phone'             },
  { header: 'تاريخ البدء',   dataKey: 'maintenanceStartDate' },
  { header: 'تاريخ الانتهاء', dataKey: 'endDate'          },
  { header: 'السعر',         dataKey: 'price'             },
] as const;
