import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Calendar } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';

import { dataService }    from '../services/dataService';
import { exportService }  from '../services/exportService';
import { Offer }          from '../types';

// ── Offer-specific components ────────────────────────────────────────────────
import { AddOfferModal }    from '../components/offers/AddOfferModal';
import { OfferDetailModal } from '../components/offers/OfferDetailModal';
import { createDefaultOffer } from '../components/offers/offerFormDefaults';
import { SEARCH_TYPES }    from '../components/offers/offerConstants';

// ── Shared modals ────────────────────────────────────────────────────────────
import { ConfirmEditModal }   from '../components/shared/ConfirmEditModal';
import { ConfirmDeleteModal } from '../components/shared/ConfirmDeleteModal';
import { DownloadRangeModal } from '../components/shared/DownloadRangeModal';

// ─────────────────────────────────────────────────────────────────────────────
export const Offers: React.FC = () => {
  // ── Data & search ──────────────────────────────────────────────────────────
  const [offers, setOffers]           = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType]   = useState<typeof SEARCH_TYPES[number]['key']>('customerName');

  // ── Modal open flags ───────────────────────────────────────────────────────
  const [isAddOpen,        setIsAddOpen]        = useState(false);
  const [isDetailOpen,     setIsDetailOpen]     = useState(false);
  const [isConfirmEdit,    setIsConfirmEdit]    = useState(false);
  const [isConfirmDelete,  setIsConfirmDelete]  = useState(false);
  const [isDownloadOpen,   setIsDownloadOpen]   = useState(false);

  // ── Selected record & edit mode ────────────────────────────────────────────
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isEditMode,    setIsEditMode]    = useState(false);

  // ── Form / download state ──────────────────────────────────────────────────
  const [formData,       setFormData]      = useState<Partial<Offer>>(createDefaultOffer());
  const [downloadRange,  setDownloadRange] = useState({
    from: format(new Date(), 'yyyy-MM-01'),
    to:   format(new Date(), 'yyyy-MM-dd'),
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => { loadOffers(); }, []);

  const loadOffers = () => {
    const data = dataService.getAll<Offer>('offers');
    setOffers(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) { loadOffers(); return; }
    setOffers(dataService.search<Offer>('offers', query, [searchType]));
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const count       = dataService.getAll<Offer>('offers').length + 1;
    const offerNumber = `OFF-${String(count).padStart(4, '0')}`;
    dataService.create<Offer>('offers', { ...formData as Offer, offerNumber, createdAt: new Date().toISOString() });
    loadOffers();
    setIsAddOpen(false);
    setFormData(createDefaultOffer());
  };

  const handleUpdate = () => {
    if (!selectedOffer) return;
    dataService.update<Offer>('offers', selectedOffer.id, formData);
    loadOffers();
    setIsEditMode(false);
    const updated = dataService.getById<Offer>('offers', selectedOffer.id);
    if (updated) setSelectedOffer(updated);
  };

  const handleDelete = () => {
    if (!selectedOffer) return;
    dataService.delete('offers', selectedOffer.id);
    loadOffers();
    setIsConfirmDelete(false);
    setIsDetailOpen(false);
    setSelectedOffer(null);
  };

  // ── Open detail ────────────────────────────────────────────────────────────
  const openDetail = (offer: Offer) => {
    setSelectedOffer(offer);
    setFormData(offer);
    setIsEditMode(false);
    setIsDetailOpen(true);
  };

  // ── Download Excel ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    const filtered = offers.filter(o =>
      isWithinInterval(parseISO(o.date), {
        start: parseISO(downloadRange.from),
        end:   parseISO(downloadRange.to),
      })
    );
    exportService.toExcel(filtered, 'عروض_الأسعار');
    setIsDownloadOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-1">
          <FileText className="text-accent" />
          عروض الأسعار
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsDownloadOpen(true)}
            className="text-sm md:text-lg flex-1 sm:flex-none bg-white border border-line text-secondary font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-bg transition-colors"
          >
            <Download size={16} /> <span>تحميل العروض</span>
          </button>
          <button
            onClick={() => { setFormData(createDefaultOffer()); setIsAddOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none btn-primary flex items-center justify-center gap-1 md:gap-2 shadow-sm px-2 sm:px-4"
          >
            <Plus size={18} /> <span>عرض جديد</span>
          </button>
        </div>
      </div>

      {/* ── Search Type Chips ─────────────────────────────────────────────── */}
      <div className="chips-row">
        {SEARCH_TYPES.map(({ label, key }) => (
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

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={`ابحث عن عرض بـ ${SEARCH_TYPES.find(t => t.key === searchType)?.label ?? ''}...`}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-3 sm:pl-4 focus:border-primary outline-none shadow-sm text-sm"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* ── Desktop Table ─────────────────────────────────────────────────── */}
      <div className="hidden sm:block overflow-hidden bg-white rounded-xl border border-line shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-[#fcfcfc] border-b border-line">
            <tr>
              {['رقم العرض', 'اسم العميل', 'التليفون', 'العنوان', 'التاريخ', 'الإجمالي'].map(h => (
                <th key={h} className="px-6 py-4 font-bold text-xs text-secondary uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {offers.map(offer => (
              <tr
                key={offer.id}
                onClick={() => openDetail(offer)}
                className="hover:bg-bg cursor-pointer transition-all"
              >
                <td className="px-6 py-4 font-bold text-accent">{offer.offerNumber}</td>
                <td className="px-6 py-4 font-medium">{offer.customerName}</td>
                <td className="px-6 py-4 text-secondary" dir="ltr">{offer.phone}</td>
                <td className="px-6 py-4 truncate max-w-xs text-secondary">{offer.address}</td>
                <td className="px-6 py-4 text-secondary text-xs">{offer.date}</td>
                <td className="px-6 py-4 font-bold text-primary">{(offer.price || 0).toLocaleString()} جنيه</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {offers.map(offer => (
          <div
            key={offer.id}
            onClick={() => openDetail(offer)}
            className="card space-y-1 active:scale-95 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-success mb-0.5 inline-block">{offer.offerNumber}</span>
                <h3 className="text-lg font-bold">{offer.customerName}</h3>
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-primary">{(offer.price || 0).toLocaleString()}</span>
                <span className="text-[10px] block text-secondary font-bold">جنيه مصري</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary font-medium pt-3 border-t border-line">
              <span className="flex items-center gap-1"><Calendar size={14} /> {offer.date}</span>
              <span className="flex items-center gap-1 justify-end truncate">{offer.address}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AddOfferModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreate}
      />

      <OfferDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        offer={selectedOffer}
        formData={formData}
        onChange={setFormData}
        isEditMode={isEditMode}
        onRequestEdit={() => setIsConfirmEdit(true)}
        onSave={handleUpdate}
        onCancelEdit={() => setIsEditMode(false)}
        onRequestDelete={() => setIsConfirmDelete(true)}
      />

      <ConfirmEditModal
        isOpen={isConfirmEdit}
        onClose={() => setIsConfirmEdit(false)}
        onConfirm={() => { setIsEditMode(true); setIsConfirmEdit(false); }}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmDelete}
        onClose={() => setIsConfirmDelete(false)}
        onConfirm={handleDelete}
        entityLabel="هذا العرض"
      />

      <DownloadRangeModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        range={downloadRange}
        onRangeChange={setDownloadRange}
        onDownload={handleDownload}
        entityLabel="العروض"
      />
    </div>
  );
};
