import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, Download, Calendar } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';

import { dataService }   from '../services/dataService';
import { exportService } from '../services/exportService';
import { MaintenanceContract } from '../types';

// ── Maintenance-specific components ──────────────────────────────────────────
import { AddMaintenanceModal }     from '../components/maintenance/AddMaintenanceModal';
import { MaintenanceDetailModal }  from '../components/maintenance/MaintenanceDetailModal';
import { createDefaultContract }   from '../components/maintenance/maintenanceFormDefaults';
import { calcEndDate, MAINTENANCE_SEARCH_TYPES } from '../components/maintenance/maintenanceConstants';

// ── Shared modals ─────────────────────────────────────────────────────────────
import { ConfirmEditModal }   from '../components/shared/ConfirmEditModal';
import { ConfirmDeleteModal } from '../components/shared/ConfirmDeleteModal';
import { DownloadRangeModal } from '../components/shared/DownloadRangeModal';

// ─────────────────────────────────────────────────────────────────────────────
export const Maintenance: React.FC = () => {
  // ── Data & search ───────────────────────────────────────────────────────────
  const [contracts, setContracts]     = useState<MaintenanceContract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType]   = useState<typeof MAINTENANCE_SEARCH_TYPES[number]['key']>('customerName');

  // ── Modal flags ─────────────────────────────────────────────────────────────
  const [isAddOpen,       setIsAddOpen]       = useState(false);
  const [isDetailOpen,    setIsDetailOpen]    = useState(false);
  const [isConfirmEdit,   setIsConfirmEdit]   = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isDownloadOpen,  setIsDownloadOpen]  = useState(false);

  // ── Selected record & edit mode ─────────────────────────────────────────────
  const [selectedContract, setSelectedContract] = useState<MaintenanceContract | null>(null);
  const [isEditMode,        setIsEditMode]        = useState(false);

  // ── Form / download state ───────────────────────────────────────────────────
  const [formData,      setFormData]      = useState<Partial<MaintenanceContract>>(createDefaultContract());
  const [downloadRange, setDownloadRange] = useState({
    from: format(new Date(), 'yyyy-MM-01'),
    to:   format(new Date(), 'yyyy-MM-dd'),
  });

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => { loadContracts(); }, []);

  const loadContracts = () => {
    const data = dataService.getAll<MaintenanceContract>('maintenance');
    setContracts(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) { loadContracts(); return; }
    setContracts(dataService.search<MaintenanceContract>('maintenance', query, [searchType]));
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const count = dataService.getAll<MaintenanceContract>('maintenance').length + 1;
    const maintenanceNumber = `MNT-${String(count).padStart(4, '0')}`;

    // Ensure endDate is calculated before saving
    const endDate = calcEndDate(
      formData.maintenanceStartDate ?? '',
      formData.contractDuration ?? ''
    );

    dataService.create<MaintenanceContract>('maintenance', {
      ...formData as MaintenanceContract,
      maintenanceNumber,
      endDate,
      createdAt: new Date().toISOString(),
    });
    loadContracts();
    setIsAddOpen(false);
    setFormData(createDefaultContract());
  };

  const handleUpdate = () => {
    if (!selectedContract) return;
    dataService.update<MaintenanceContract>('maintenance', selectedContract.id, formData);
    loadContracts();
    setIsEditMode(false);
    const updated = dataService.getById<MaintenanceContract>('maintenance', selectedContract.id);
    if (updated) setSelectedContract(updated);
  };

  const handleDelete = () => {
    if (!selectedContract) return;
    dataService.delete('maintenance', selectedContract.id);
    loadContracts();
    setIsConfirmDelete(false);
    setIsDetailOpen(false);
    setSelectedContract(null);
  };

  // ── Open detail ─────────────────────────────────────────────────────────────
  const openDetail = (contract: MaintenanceContract) => {
    setSelectedContract(contract);
    setFormData(contract);
    setIsEditMode(false);
    setIsDetailOpen(true);
  };

  // ── Download Excel ──────────────────────────────────────────────────────────
  const handleDownload = () => {
    const filtered = contracts.filter(c =>
      isWithinInterval(parseISO(c.date), {
        start: parseISO(downloadRange.from),
        end:   parseISO(downloadRange.to),
      })
    );
    exportService.toExcel(filtered, 'عقود_الصيانة');
    setIsDownloadOpen(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-1">
          <Wrench className="text-accent" />
          عقود الصيانة
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsDownloadOpen(true)}
            className="text-sm md:text-lg flex-1 sm:flex-none bg-white border border-line text-secondary font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 hover:bg-bg transition-colors"
          >
            <Download size={16} /> <span>تحميل العقود</span>
          </button>
          <button
            onClick={() => { setFormData(createDefaultContract()); setIsAddOpen(true); }}
            className="text-sm md:text-lg flex-1 sm:flex-none btn-primary flex items-center justify-center gap-1 md:gap-2 shadow-sm px-2 sm:px-4"
          >
            <Plus size={18} /> <span>عقد جديد</span>
          </button>
        </div>
      </div>

      {/* ── Search Type Chips ──────────────────────────────────────────────── */}
      <div className="chips-row">
        {MAINTENANCE_SEARCH_TYPES.map(({ label, key }) => (
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
          placeholder={`ابحث عن عقد بـ ${MAINTENANCE_SEARCH_TYPES.find(t => t.key === searchType)?.label ?? ''}...`}
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
              {['رقم العقد', 'اسم العميل', 'التليفون', 'تاريخ البدء', 'تاريخ الانتهاء', 'مدة العقد', 'السعر'].map(h => (
                <th key={h} className="px-6 py-4 font-bold text-xs text-secondary uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {contracts.map(contract => (
              <tr
                key={contract.id}
                onClick={() => openDetail(contract)}
                className="hover:bg-bg cursor-pointer transition-all"
              >
                <td className="px-6 py-4 font-bold text-accent">{contract.maintenanceNumber}</td>
                <td className="px-6 py-4 font-medium">{contract.customerName}</td>
                <td className="px-6 py-4 text-secondary" dir="ltr">{contract.phone}</td>
                <td className="px-6 py-4 text-secondary text-xs">{contract.maintenanceStartDate}</td>
                <td className="px-6 py-4 text-secondary text-xs">{contract.endDate}</td>
                <td className="px-6 py-4 text-secondary text-xs">{contract.contractDuration}</td>
                <td className="px-6 py-4 font-bold text-primary">{(contract.price || 0).toLocaleString()} جنيه</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {contracts.map(contract => (
          <div
            key={contract.id}
            onClick={() => openDetail(contract)}
            className="card space-y-1 active:scale-95 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-warning mb-0.5 inline-block">{contract.maintenanceNumber}</span>
                <h3 className="text-lg font-bold">{contract.customerName}</h3>
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-primary">{(contract.price || 0).toLocaleString()}</span>
                <span className="text-[10px] block text-secondary font-bold">جنيه مصري</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary font-medium pt-3 border-t border-line">
              <span className="flex items-center gap-1"><Calendar size={14} /> {contract.maintenanceStartDate}</span>
              <span className="flex items-center justify-end gap-1 truncate">{contract.contractDuration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AddMaintenanceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreate}
      />

      <MaintenanceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        contract={selectedContract}
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
        entityLabel="هذا العقد"
      />

      <DownloadRangeModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        range={downloadRange}
        onRangeChange={setDownloadRange}
        onDownload={handleDownload}
        entityLabel="العقود"
      />
    </div>
  );
};
