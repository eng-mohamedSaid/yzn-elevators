import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Download, ExternalLink, Calendar, Users, Briefcase } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Site } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

export const Sites: React.FC = () => {
    const [sites, setSites] = useState<Site[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'siteName' | 'siteNumber' | 'address'>('siteName');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Site>>({
        siteName: '',
        address: '',
        mapUrl: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        price: 0,
        stagePrice: 0,
        stagesCount: 1,
        stopPrice: 0,
        customerType: 'client',
    });

    useEffect(() => { loadSites(); }, []);

    const loadSites = () => {
        const data = dataService.getAll<Site>('sites');
        setSites(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = dataService.search<Site>('sites', query, [searchType]);
        setSites(filtered);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const count = dataService.getAll<Site>('sites').length + 1;
        const siteNumber = `SITE-${String(count).padStart(4, '0')}`;
        const totalDays = differenceInDays(new Date(formData.endDate!), new Date(formData.startDate!));

        dataService.create<Site>('sites', {
            ...formData as Site,
            siteNumber,
            totalDays,
            createdAt: new Date().toISOString()
        });
        
        loadSites();
        setIsAddModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            siteName: '',
            address: '',
            mapUrl: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
            price: 0,
            stagePrice: 0,
            stagesCount: 1,
            stopPrice: 0,
            customerType: 'client',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-accent" />
                    إدارة المواقع
                </h1>
                <button 
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    إضافة موقع جديد
                </button>
            </div>

            <div className="chips-row">
                {[
                    { label: 'اسم الموقع', key: 'siteName' },
                    { label: 'رقم الموقع', key: 'siteNumber' },
                    { label: 'العنوان', key: 'address' }
                ].map(type => (
                    <button
                        key={type.key}
                        onClick={() => setSearchType(type.key as any)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm border font-medium ${searchType === type.key ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-500 border-gray-100'}`}
                    >
                        بحث بـ {type.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="ابحث عن موقع..."
                    className="w-full bg-white border border-gray-100 rounded-xl py-4 pr-12 pl-4 outline-none shadow-sm"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <div className="hidden lg:block overflow-hidden bg-white rounded-xl border border-line shadow-sm">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#fcfcfc] border-b border-line">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">رقم الموقع</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">اسم الموقع</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">العنوان</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">تاريخ الاستلام</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">الانتهاء المتوقع</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">الحالة</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">السعر</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-primary">
                        {sites.map(site => (
                            <tr key={site.id} onClick={() => navigate(`/sites/${site.id}`)} className="hover:bg-bg cursor-pointer transition-all">
                                <td className="px-6 py-4 font-bold text-accent">{site.siteNumber}</td>
                                <td className="px-6 py-4 font-bold">{site.siteName}</td>
                                <td className="px-6 py-4 text-xs text-secondary truncate max-w-xs">{site.address}</td>
                                <td className="px-6 py-4 text-xs text-secondary">{site.startDate}</td>
                                <td className="px-6 py-4 text-xs text-secondary">{site.endDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`badge ${site.customerType === 'company' ? 'badge-success' : 'badge-warning'}`}>
                                        {site.customerType === 'company' ? 'شركة' : 'عميل'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">{(site.price || 0).toLocaleString()} ر.س</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {sites.map(site => (
                    <div key={site.id} onClick={() => navigate(`/sites/${site.id}`)} className="card space-y-4">
                        <div className="flex justify-between items-start text-sm">
                            <div>
                                <span className="badge badge-success mb-1 inline-block">{site.siteNumber}</span>
                                <h3 className="text-lg font-bold tracking-tight">{site.siteName}</h3>
                                <p className="text-[11px] text-secondary mt-1 flex items-center gap-1 font-medium"><MapPin size={12} className="text-accent" /> {site.address}</p>
                            </div>
                            <span className={`badge ${site.customerType === 'company' ? 'badge-success' : 'badge-warning'}`}>
                                {site.customerType === 'company' ? 'شركة' : 'عميل'}
                            </span>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-line text-[10px] text-secondary font-bold">
                            <div className="flex flex-col">
                                <span className="uppercase text-[9px] text-secondary/60">الاستلام</span>
                                <span>{site.startDate}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="uppercase text-[9px] text-secondary/60">الانتهاء</span>
                                <span>{site.endDate}</span>
                            </div>
                            <div className="mr-auto flex flex-col items-end">
                                <span className="uppercase text-[9px] text-secondary/60">السعر</span>
                                <span className="font-bold text-sm text-primary">{(site.price || 0).toLocaleString()} ر.س</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة موقع عمل جديد" size="lg">
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="اسم الموقع" placeholder="اسم الموقع أو العميل" value={formData.siteName || ''} onChange={(val: string) => setFormData({...formData, siteName: val})} />
                    <Input label="العنوان" placeholder="عنوان العمل" value={formData.address || ''} onChange={(val: string) => setFormData({...formData, address: val})} />
                    <Input label="الموقع على الخريطة (URL)" placeholder="رابط Google Maps" value={formData.mapUrl || ''} onChange={(val: string) => setFormData({...formData, mapUrl: val})} />
                    <Select 
                        label="نوع العميل" 
                        options={['client', 'company']} 
                        value={formData.customerType || ''} 
                        onChange={val => setFormData({...formData, customerType: val as any})} 
                    />
                    <Input label="تاريخ الاستلام" type="date" value={formData.startDate || ''} onChange={(val: string) => setFormData({...formData, startDate: val})} />
                    <Input label="تاريخ الانتهاء" type="date" value={formData.endDate || ''} onChange={(val: string) => setFormData({...formData, endDate: val})} />
                    <Input label="السعر الإجمالي" type="number" placeholder="قيمة العقد" value={formData.price || 0} onChange={(val: string) => setFormData({...formData, price: Number(val)})} />
                    <Input label="عدد المراحل" type="number" placeholder="مثال: 4" value={formData.stagesCount || 0} onChange={(val: string) => setFormData({...formData, stagesCount: Number(val)})} />
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                        <button type="submit" className="w-full btn-primary py-4 rounded-xl shadow-sm mt-4">إضافة الموقع</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
