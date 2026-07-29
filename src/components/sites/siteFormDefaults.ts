import { format } from 'date-fns';
import { Site } from '../../types';

export const createDefaultSite = (): Partial<Site> => ({
  siteName:      '',
  address:       '',
  mapUrl:        '',
  startDate:     format(new Date(), 'yyyy-MM-dd'),
  endDate:       format(new Date(), 'yyyy-MM-dd'),
  totalDays:     0,
  price:         0,
  elevatorCount: 1,
  elevatorType:  '',
  stopPrice:     0,
  stopsCount:    0,
  stagePrice:    0,
  stagesCount:   1,
  customerType:  'عميل',
  currentStage:  'برج',
});
