import { format } from 'date-fns';
import { Worker } from '../../types';

export const createDefaultWorker = (): Partial<Worker> => ({
  name:       '',
  role:       'فني',
  salaryType: 'يومية',
  baseSalary: 0,
  joinDate:   format(new Date(), 'yyyy-MM-dd'),
  notes:      '',
});
