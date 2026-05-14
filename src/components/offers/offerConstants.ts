export const ELEVATOR_TYPES = ['عادي', 'هايدروليك', 'جيرليس عادي', 'جيرليس اتوماتيك', 'وايدرامب', 'باكدج', 'طعام', 'بانوراما', 'بضاعة'];
export const MACHINE_TYPES  = ['ايطالي', 'سيكور', 'البرتوساسي', 'بريمو', 'موتوناري', 'ايطال جير', 'جي ام', 'جي ام في', 'موريس', 'تيسن'];
export const CONTROL_BOARDS = ['كاس', 'التامترو', 'الترونيك', 'لاب ستار', 'فيجا', 'تركي'];
export const BATTERIES       = ['UPS', 'بطارية طوارئ', 'لا يوجد'];
export const VVVFS           = ['شنايدر', 'اسكاوا', 'جيفرن', 'دلتا', 'صانشي', 'اينفت'];
export const RAILS           = ['5 مم', '9 مم', '16 مم'];
export const REMOVAL_OPTIONS = ['يوجد', 'لا يوجد'];
export const CUSTOMER_TYPES  = ['عميل', 'شركة'];

export const PDF_COLUMNS = [
  { header: 'رقم العرض',  dataKey: 'offerNumber'  },
  { header: 'اسم العميل', dataKey: 'customerName' },
  { header: 'التليفون',   dataKey: 'phone'         },
  { header: 'العنوان',    dataKey: 'address'       },
  { header: 'المصعد',     dataKey: 'elevatorType'  },
  { header: 'السعر',      dataKey: 'price'         },
] as const;

export const SEARCH_TYPES = [
  { label: 'الاسم',      key: 'customerName' },
  { label: 'رقم العرض',  key: 'offerNumber'  },
  { label: 'التليفون',   key: 'phone'        },
  { label: 'العنوان',    key: 'address'      },
] as const;
