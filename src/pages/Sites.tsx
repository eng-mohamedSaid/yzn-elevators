import React, { useState } from 'react';
import { Plus, Search, MapPin, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isWithinInterval, parseISO } from 'date-fns';

import { dataService }   from '../services/dataService';
import { exportService } from '../services/exportService';
import { Site } from '../types';

import { AddSiteModal }      from '../components/sites/AddSiteModal';
import { createDefaultSite } from '../components/sites/siteFormDefaults';
import { calcTotalDays, SITE_SEARCH_TYPES } from '../components/sites/siteConstants';

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

export const Sites: React.FC = () => {
  const navigate = useNavigate();

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType]   = useState<typeof SITE_SEARCH_TYPES[number]['key']>('siteName');
  const debouncedQuery = useDebouncedValue(searchQuery);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [isAddOpen,      setIsAddOpen]      = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // ── Form / download state ───────────────────────────────────────────────────
  const [formData,      setFormData]      = useState<Partial<Site>>(createDefaultSite());
  const [downloadRange, setDownloadRange] = useState({
    from: format(new Date(), 'yyyy-MM-01'),
    to:   format(new Date(), 'yyyy-MM-dd'),
  });

  // ── Load (re-runs on every search change; `reload` powers the retry button) ─
  const {
    data, isLoading, isFetching, error, reload,
  } = useAsyncData<Site[]>(async () => {
    const rows = debouncedQuery
      ? await dataService.search<Site>('sites', debouncedQuery, [searchType])
      : await dataService.getAll<Site>('sites');
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [debouncedQuery, searchType]);

  const sites = data ?? [];

  // ── Create ──────────────────────────────────────────────────────────────────
  const create = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    const count = (await dataService.getAll<Site>('sites')).length + 1;
    const siteNumber = `SITE-${String(count).padStart(4, '0')}`;
    const totalDays = calcTotalDays(formData.startDate ?? '', formData.endDate ?? '');

    await dataService.create<Site>('sites', {
      ...(formData as Site),
      siteNumber,
      totalDays,
      createdAt: new Date().toISOString(),
    });
    await reload();
    setIsAddOpen(false);
    setFormData(createDefaultSite());
  });

  // ── Download Excel ──────────────────────────────────────────────────────────
  const download = useAsyncAction(async () => {
    await nextFrame();
    const filtered = sites.filter(s =>
      isWithinInterval(parseISO(s.startDate), {
        start: parseISO(downloadRange.from),
        end:   parseISO(downloadRange.to),
      })
    );
    exportService.toExcel(filtered, 'المواقع');
    setIsDownloadOpen(false);
  });

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-1">
          <MapPin className="text-accent" />
          إدارة المواقع
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => { download.clearError(); setIsDownloadOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none bg-white border border-line text-secondary font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-bg transition-colors"
          >
            <Download size={16} /> <span>تحميل المواقع</span>
          </button>
          <button
            onClick={() => { setFormData(createDefaultSite()); create.clearError(); setIsAddOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none btn-primary flex items-center justify-center gap-1 md:gap-2 shadow-sm px-2 sm:px-4"
          >
            <Plus size={18} /> <span>موقع جديد</span>
          </button>
        </div>
      </div>

      {/* ── Search Type Chips ──────────────────────────────────────────────── */}
      <div className="chips-row">
        {SITE_SEARCH_TYPES.map(({ label, key }) => (
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
          placeholder={`ابحث عن موقع بـ ${SITE_SEARCH_TYPES.find(t => t.key === searchType)?.label ?? ''}...`}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-11 sm:pl-12 focus:border-primary outline-none shadow-sm text-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {/* Background refresh over already-visible rows — no full-page swap. */}
        {isFetching && !isLoading && (
          <Spinner size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
        )}
      </div>

      {/* ── Data ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingState hint="يتم الآن جلب المواقع" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} isRetrying={isFetching} />
      ) : sites.length === 0 ? (
        <EmptyState
          icon={MapPin}
          message={searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد مواقع بعد'}
          hint={searchQuery ? 'جرّب كلمة بحث أخرى أو غيّر نوع البحث.' : 'اضغط «موقع جديد» لإضافة أول موقع.'}
        />
      ) : (
        <>
          {/* ── Desktop Table ─────────────────────────────────────────────── */}
          <div className="hidden lg:block overflow-hidden bg-white rounded-xl border border-line shadow-sm">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#fcfcfc] border-b border-line">
                <tr>
                  {['رقم الموقع', 'اسم الموقع', 'العنوان', 'البداية', 'النهاية', 'أيام العمل', 'المصاعد', 'المرحلة', 'السعر'].map(h => (
                    <th key={h} className="px-4 py-4 font-bold text-xs text-secondary uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-primary">
                {sites.map(site => (
                  <tr key={site.id} onClick={() => navigate(`/sites/${site.id}`)} className="hover:bg-bg cursor-pointer transition-all">
                    <td className="px-4 py-4 font-bold text-accent">{site.siteNumber}</td>
                    <td className="px-4 py-4 font-bold">{site.siteName}</td>
                    <td className="px-4 py-4 text-xs text-secondary truncate max-w-[12rem]">{site.address}</td>
                    <td className="px-4 py-4 text-xs text-secondary">{site.startDate}</td>
                    <td className="px-4 py-4 text-xs text-secondary">{site.endDate}</td>
                    <td className="px-4 py-4 text-xs font-bold">{site.totalDays ?? 0}</td>
                    <td className="px-4 py-4 text-xs font-bold">{site.elevatorCount ?? 0}</td>
                    <td className="px-4 py-4">
                      <span className="badge badge-success">{site.currentStage || '—'}</span>
                    </td>
                    <td className="px-4 py-4 font-bold">{(site.price || 0).toLocaleString()} جنيه</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-2 lg:hidden">
            {sites.map(site => (
              <div key={site.id} onClick={() => navigate(`/sites/${site.id}`)} className="card space-y-3 active:scale-95 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="badge badge-success mb-1 inline-block">{site.siteNumber}</span>
                    <h3 className="text-lg font-bold tracking-tight">{site.siteName}</h3>
                    <p className="text-[11px] text-secondary mt-1 flex items-center gap-1 font-medium">
                      <MapPin size={12} className="text-accent" /> {site.address}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-bold text-primary">{(site.price || 0).toLocaleString()}</span>
                    <span className="text-[10px] block text-secondary font-bold">جنيه</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-3 border-t border-line text-[10px] text-secondary font-bold">
                  <div className="flex flex-col">
                    <span className="uppercase text-[9px] text-secondary/60 flex items-center gap-1"><Calendar size={10} /> البداية</span>
                    <span>{site.startDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-[9px] text-secondary/60">النهاية</span>
                    <span>{site.endDate}</span>
                  </div>
                  <div className="mr-auto flex flex-col items-end">
                    <span className="uppercase text-[9px] text-secondary/60">المرحلة</span>
                    <span className="text-primary">{site.currentStage || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AddSiteModal
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
        entityLabel="المواقع"
        isDownloading={download.isPending}
        downloadError={download.error}
      />
    </div>
  );
};
