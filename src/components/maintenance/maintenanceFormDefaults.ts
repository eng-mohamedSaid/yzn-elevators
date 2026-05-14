import { format } from 'date-fns';
import { MaintenanceContract } from '../../types';
import { MAINTENANCE_ELEVATOR_TYPES, CONTRACT_DURATION_LABELS } from './maintenanceConstants';

export const createDefaultContract = (): Partial<MaintenanceContract> => ({
  customerName:         '',
  nationalId:           '',
  phone:                '',
  address:              '',
  locationUrl:          '',
  date:                 format(new Date(), 'yyyy-MM-dd'),
  elevatorType:         MAINTENANCE_ELEVATOR_TYPES[0],
  elevatorCount:        1,
  floors:               0,
  maintenanceStartDate: format(new Date(), 'yyyy-MM-dd'),
  contractDuration:     CONTRACT_DURATION_LABELS[4], // 'سنة'
  endDate:              '',
  price:                0,
  notes:                '',
});
