import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, Download, Trash2, Edit3, Calendar, Repeat } from 'lucide-react';
import { dataService } from '../services/dataService';
import { MaintenanceContract } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { format } from 'date-fns';

export const Maintenance: React.FC = () => {
    const [contracts, setContracts] = useState<MaintenanceContract[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'customerName' | 'phone' | 'maintenanceNumber' | 'address'>('customerName');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<MaintenanceContract | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState<Partial<MaintenanceContract>>({
        customerName: '',
        phone: '',
        address: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        elevatorType: '',
        elevatorCount: 1,
        visitFrequency: 'monthly',
        contractDuration: 'سنة واحدة',
        notes: '',
        total: 0,
    });

    useEffect(() => { loadContracts(); }, []);

    const loadContracts = () => {
        const data = dataService.getAll<MaintenanceContract>('maintenance');
        setContracts(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = dataService.search<MaintenanceContract>('maintenance', query, [searchType]);
        setContracts(filtered);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const count = dataService.getAll<MaintenanceContract>('maintenance').length + 1;
        const maintenanceNumber = `MNT-${String(count).padStart(4, '0')}`;
        dataService.create<MaintenanceContract>('maintenance', {
            ...formData as MaintenanceContract,
            maintenanceNumber,
            createdAt: new Date().toISOString()
        });
        loadContracts();
        setIsAddModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            phone: '',
            address: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            elevatorType: '',
            elevatorCount: 1,
            visitFrequency: 'monthly',
            contractDuration: 'سنة واحدة',
            notes: '',
            total: 0,
        });
    };

    const openDetails = (contract: MaintenanceContract) => {
        setSelectedContract(contract);
        setFormData(contract);
        setIsDetailModalOpen(true);
        setIsEditMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Wrench className="text-accent" />
                    عقود الصيانة
                </h1>
                <button 
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    إضافة عقد صيانة
                </button>
            </div>

            <div className="chips-row">
                {[
                    { label: 'الاسم', key: 'customerName' },
                    { label: 'رقم العقد', key: 'maintenanceNumber' },
                    { label: 'التليفون', key: 'phone' }
                ].map(type => (
                    <button
                        key={type.key}
                        onClick={() => setSearchType(type.key as any)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm border ${searchType === type.key ? 'bg-secondary text-white' : 'bg-white text-gray-500'}`}
                    >
                        بحث بـ {type.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="ابحث عن عقد صيانة..."
                    className="w-full bg-white border rounded-xl py-4 pr-12 outline-none"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <div className="hidden sm:block overflow-hidden bg-white rounded-xl border border-line shadow-sm">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfcfc] border-b border-line">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">رقم العقد</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">اسم العميل</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">التليفون</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">تكرار الزيارة</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">تاريخ العقد</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-primary">
                        {contracts.map(contract => (
                            <tr key={contract.id} onClick={() => openDetails(contract)} className="hover:bg-bg cursor-pointer transition-colors">
                                <td className="px-6 py-4 font-bold text-accent">{contract.maintenanceNumber}</td>
                                <td className="px-6 py-4 font-medium">{contract.customerName}</td>
                                <td className="px-6 py-4 text-secondary" dir="ltr">{contract.phone}</td>
                                <td className="px-6 py-4 text-xs font-medium uppercase text-secondary">{contract.visitFrequency === 'monthly' ? 'شهري' : contract.visitFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوي'}</td>
                                <td className="px-6 py-4 text-secondary text-xs">{contract.date}</td>
                                <td className="px-6 py-4 font-bold">{(contract.total || 0).toLocaleString()} ر.س</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {contracts.map(contract => (
                    <div key={contract.id} onClick={() => openDetails(contract)} className="card space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="badge badge-warning mb-2 inline-block">
                                    {contract.maintenanceNumber}
                                </span>
                                <h3 className="text-lg font-bold tracking-tight">{contract.customerName}</h3>
                            </div>
                            <div className="text-left font-bold text-primary">{(contract.total || 0).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between text-[11px] text-secondary font-medium pt-3 border-t border-line">
                            <span className="flex items-center gap-1"><Repeat size={14} className="text-accent" /> {contract.visitFrequency}</span>
                            <span>{contract.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة عقد صيانة جديد" size="lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="اسم العميل" placeholder="اسم العميل بالكامل" value={formData.customerName} onChange={val => setFormData({...formData, customerName: val})} />
                    <Input label="رقم التليفون" placeholder="رقم الموبايل" value={formData.phone} onChange={val => setFormData({...formData, phone: val})} />
                    <div className="col-span-2">
                        <Input label="العنوان" placeholder="عنوان العقار" value={formData.address} onChange={val => setFormData({...formData, address: val})} />
                    </div>
                    <Input label="تاريخ البدء" type="date" value={formData.date} onChange={val => setFormData({...formData, date: val})} />
                    <Select 
                        label="تكرار الزيارة" 
                        options={['monthly', 'quarterly', 'semi-annually', 'annually']} 
                        value={formData.visitFrequency || ''} 
                        onChange={val => setFormData({...formData, visitFrequency: val as any})} 
                    />
                    <Input label="عدد المصاعد" type="number" placeholder="..." value={formData.elevatorCount} onChange={val => setFormData({...formData, elevatorCount: Number(val)})} />
                    <Input label="الإجمالي" type="number" placeholder="المبلغ الكلي للعقد" value={formData.total} onChange={val => setFormData({...formData, total: Number(val)})} />
                    <button onClick={handleCreate} className="col-span-2 btn-primary py-4 rounded-xl font-bold mt-4 shadow-sm">حفظ العقد</button>
                </div>
            </Modal>
        </div>
    );
};
