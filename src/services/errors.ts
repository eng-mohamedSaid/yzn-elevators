import { ModuleType } from '../types';

/**
 * A failure shaped for the UI: `message` is the Arabic sentence shown to the
 * user, `technical` is the raw driver message kept behind a "التفاصيل التقنية"
 * disclosure so the owner can debug without exposing jargon by default.
 */
export interface AppError {
  message: string;
  technical?: string;
}

export class DataError extends Error {
  readonly technical?: string;

  constructor(message: string, technical?: string) {
    super(message);
    this.name = 'DataError';
    this.technical = technical;
  }
}

export type Operation = 'read' | 'create' | 'update' | 'delete' | 'save';

const MODULE_LABELS: Record<ModuleType, string> = {
  offers:      'عروض الأسعار',
  maintenance: 'عقود الصيانة',
  sites:       'المواقع',
  workers:     'الموظفين',
  attendance:  'سجل الحضور',
  schedule:    'جدول العمل',
};

const OPERATION_LABELS: Record<Operation, string> = {
  read:   'تحميل',
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
  save:   'حفظ',
};

export const GENERIC_ERROR_MESSAGE = 'حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى.';

/** Shape of a Postgrest / supabase-js error — kept loose on purpose. */
interface RawError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

const looksLikeNetworkFailure = (raw: RawError) => {
  const msg = (raw.message ?? '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed') ||
    msg.includes('timeout') ||
    msg.includes('aborted')
  );
};

/**
 * Map a Supabase failure onto an actionable Arabic sentence. The user should
 * always learn *what* failed and *what to do next* — never just "خطأ".
 */
export const toDataError = (module: ModuleType, operation: Operation, raw: RawError): DataError => {
  const entity = MODULE_LABELS[module];
  const action = OPERATION_LABELS[operation];
  const technical = [raw.code && `[${raw.code}]`, raw.message, raw.details, raw.hint]
    .filter(Boolean)
    .join(' — ');

  let message: string;

  if (isOffline()) {
    message = 'لا يوجد اتصال بالإنترنت. تأكد من الشبكة ثم اضغط «حاول مرة أخرى».';
  } else if (looksLikeNetworkFailure(raw)) {
    message = `تعذّر الوصول إلى الخادم أثناء ${action} ${entity}. قد يكون الاتصال ضعيفاً أو الخدمة متوقفة مؤقتاً — حاول مرة أخرى بعد لحظات.`;
  } else if (raw.code === '42P01' || raw.code === 'PGRST205') {
    message = `جدول «${entity}» غير موجود في قاعدة البيانات. يجب تنفيذ ملف schema.sql على مشروع Supabase أولاً.`;
  } else if (raw.code === '42501' || raw.code === 'PGRST301' || raw.status === 401 || raw.status === 403) {
    message = `لا توجد صلاحية لـ${action} ${entity}. راجع مفاتيح الاتصال وسياسات الحماية (RLS) في Supabase.`;
  } else if (raw.code === '23505') {
    message = `يوجد سجل بنفس البيانات مسبقاً في ${entity}. غيّر البيانات المكرّرة ثم أعد المحاولة.`;
  } else if (raw.code === '23503') {
    message = `لا يمكن ${action} هذا السجل لارتباطه ببيانات أخرى في النظام.`;
  } else if (raw.code === '23502' || raw.code === '22P02' || raw.code === '22007') {
    message = `بعض الحقول ناقصة أو غير صالحة، لذلك تعذّر ${action} ${entity}. راجع البيانات المُدخلة ثم أعد المحاولة.`;
  } else if (raw.code === 'PGRST116') {
    message = `السجل المطلوب غير موجود في ${entity}، ربما تم حذفه من جهاز آخر.`;
  } else {
    message = `تعذّر ${action} ${entity}. حاول مرة أخرى، وإذا تكرّر الخطأ تواصل مع الدعم الفني.`;
  }

  return new DataError(message, technical || undefined);
};

/** Normalize anything thrown (DataError, Error, string, …) into an `AppError`. */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof DataError) return { message: error.message, technical: error.technical };
  if (error instanceof Error)     return { message: GENERIC_ERROR_MESSAGE, technical: `${error.name}: ${error.message}` };
  if (typeof error === 'string')  return { message: GENERIC_ERROR_MESSAGE, technical: error };
  return { message: GENERIC_ERROR_MESSAGE };
};
