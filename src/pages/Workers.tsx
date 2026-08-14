import React, { useState } from 'react';
import { Plus, Search, Users, Download, Wrench, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';

import { dataService }   from '../services/dataService';
import { exportService } from '../services/exportService';
import { Worker } from '../types';

import { AddWorkerModal }      from '../components/workers/AddWorkerModal';
import { createDefaultWorker } from '../components/workers/workerFormDefaults';
import { WORKER_SEARCH_TYPES } from '../components/workers/workerConstants';

import { DownloadRangeModal } from '../components/shared/DownloadRangeModal';

// ── Async UI ─────────────────────────────────────────────────────────────────
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState }   from '../components/ui/ErrorState';
import { EmptyState }   from '../components/ui/EmptyState';
import { Spinner }      from '../components/ui/Spinner';
import { useAsyncData }      from '../hooks/useAsyncData';
import { useAsyncAction }    from '../hooks/useAsyncAction';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { nextFrame } from '../lib/nextFrame';

export const Workers: React.FC = () => {
  const navigate = useNavigate();

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType]   = useState<typeof WORKER_SEARCH_TYPES[number]['key']>('name');
  const debouncedQuery = useDebouncedValue(searchQuery);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [isAddOpen,      setIsAddOpen]      = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // ── Form / download state ───────────────────────────────────────────────────
  const [formData,      setFormData]      = useState<Partial<Worker>>(createDefaultWorker());
  const [downloadRange, setDownloadRange] = useState({
    from: format(new Date(), 'yyyy-MM-01'),
    to:   format(new Date(), 'yyyy-MM-dd'),
  });

  // ── Load (re-runs on every search change; `reload` powers the retry button) ─
  const {
    data, isLoading, isFetching, error, reload,
  } = useAsyncData<Worker[]>(async () => {
    const rows = debouncedQuery
      ? await dataService.search<Worker>('workers', debouncedQuery, [searchType])
      : await dataService.getAll<Worker>('workers');
    return rows.sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }, [debouncedQuery, searchType]);

  const workers = data ?? [];

  // ── Create ──────────────────────────────────────────────────────────────────
  const create = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.create<Worker>('workers', {
      ...(formData as Worker),
      createdAt: new Date().toISOString(),
    });
    await reload();
    setIsAddOpen(false);
    setFormData(createDefaultWorker());
  });

  // ── Download Excel ──────────────────────────────────────────────────────────
  const download = useAsyncAction(async () => {
    await nextFrame();
    const filtered = workers.filter(w =>
      w.joinDate && isWithinInterval(parseISO(w.joinDate), {
        start: parseISO(downloadRange.from),
        end:   parseISO(downloadRange.to),
      })
    );
    exportService.toExcel(filtered, 'الموظفين');
    setIsDownloadOpen(false);
  });

  const isTech = (role: Worker['role']) => role === 'مهندس' || role === 'فني';

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-1">
          <Users className="text-accent" />
          الموظفون
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => { download.clearError(); setIsDownloadOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none bg-white border border-line text-secondary font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-bg transition-colors"
          >
            <Download size={16} /> <span>تحميل الموظفين</span>
          </button>
          <button
            onClick={() => { setFormData(createDefaultWorker()); create.clearError(); setIsAddOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none btn-primary flex items-center justify-center gap-1 md:gap-2 shadow-sm px-2 sm:px-4"
          >
            <Plus size={18} /> <span>موظف جديد</span>
          </button>
        </div>
      </div>

      {/* ── Search Type Chips ──────────────────────────────────────────────── */}
      <div className="chips-row">
        {WORKER_SEARCH_TYPES.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setSearchType(key)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all border ${
              searchType === key
                ? 'bg-secondary text-white border-secondary'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            بحث بـ {label}
          </button>
        ))}
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={`ابحث عن موظف بـ ${WORKER_SEARCH_TYPES.find(t => t.key === searchType)?.label ?? ''}...`}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-11 sm:pl-12 focus:border-primary outline-none shadow-sm text-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {/* Background refresh over already-visible cards — no full-page swap. */}
        {isFetching && !isLoading && (
          <Spinner size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
        )}
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingState hint="يتم الآن جلب بيانات الموظفين" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} isRetrying={isFetching} />
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Users}
          message={searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا يوجد موظفون بعد'}
          hint={searchQuery ? 'جرّب كلمة بحث أخرى أو غيّر نوع البحث.' : 'اضغط «موظف جديد» لإضافة أول موظف.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workers.map(worker => (
            <div
              key={worker.id}
              onClick={() => navigate(`/workers/${worker.id}`)}
              className="card group hover:border-accent cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-secondary group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                  {isTech(worker.role) ? <Wrench size={24} /> : <Users size={24} />}
                </div>
                <span className={`badge ${isTech(worker.role) ? 'badge-success' : 'badge-warning'}`}>
                  {worker.role}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">{worker.name}</h3>
                <p className="text-[11px] text-secondary mt-1 flex items-center gap-1 font-medium">
                  <Calendar size={12} className="text-accent" /> انضم في: {worker.joinDate}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-line flex justify-between items-center text-sm">
                <span className="font-bold text-primary">{(worker.baseSalary || 0).toLocaleString()} جنيه</span>
                <span className="text-secondary text-[11px] font-bold">{worker.salaryType}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AddWorkerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={create.run}
        isSubmitting={create.isPending}
        submitError={create.error}
      />

      <DownloadRangeModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        range={downloadRange}
        onRangeChange={setDownloadRange}
        onDownload={download.run}
        entityLabel="الموظفين"
        isDownloading={download.isPending}
        downloadError={download.error}
      />
    </div>
  );
};
