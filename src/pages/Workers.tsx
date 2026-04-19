import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Trash2, Edit3, Calendar, Briefcase, DollarSign, Wrench } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Worker } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const Workers: React.FC = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Worker>>({
        name: '',
        joinDate: format(new Date(), 'yyyy-MM-dd'),
        baseSalary: 0,
        role: 'tech',
        notes: '',
    });

    useEffect(() => { loadWorkers(); }, []);

    const loadWorkers = () => {
        const data = dataService.getAll<Worker>('workers');
        setWorkers(data);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = dataService.search<Worker>('workers', query, ['name']);
        setWorkers(filtered);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        dataService.create<Worker>('workers', formData as Worker);
        loadWorkers();
        setIsAddModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            joinDate: format(new Date(), 'yyyy-MM-dd'),
            baseSalary: 0,
            role: 'tech',
            notes: '',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-accent" />
                    الموظفون
                </h1>
                <button 
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="btn-primary flex items-center justify-center gap-2 shadow-sm px-3 sm:px-4"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">موظف</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="ابحث باسم الموظف..."
                    className="w-full bg-white border rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-3 sm:pl-4 outline-none shadow-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map(worker => (
                    <div 
                        key={worker.id} 
                        onClick={() => navigate(`/workers/${worker.id}`)}
                        className="card group hover:border-accent cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-secondary group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                {worker.role === 'tech' ? <Wrench size={24} /> : <Users size={24} />}
                            </div>
                            <span className={`badge ${worker.role === 'tech' ? 'badge-success' : 'badge-warning'}`}>
                                {worker.role === 'tech' ? 'فني' : 'عامل'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">{worker.name}</h3>
                            <p className="text-[11px] text-secondary mt-1 flex items-center gap-1 font-medium"><Calendar size={12} className="text-accent" /> انضم في: {worker.joinDate}</p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-line flex justify-between items-center text-sm">
                            <span className="font-bold text-primary">{(worker.baseSalary || 0).toLocaleString()} ريال</span>
                            <span className="text-secondary text-[11px] font-bold uppercase">راتب أساسي</span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة موظف">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input label="اسم الموظف" placeholder="الاسم الرباعي" value={formData.name || ''} onChange={(val: string) => setFormData({...formData, name: val})} />
                    <Select 
                        label="التخصص / الدور" 
                        options={['tech', 'worker']} 
                        value={formData.role || ''} 
                        onChange={val => setFormData({...formData, role: val as any})} 
                    />
                    <Input label="تاريخ بداية العمل" type="date" value={formData.joinDate || ''} onChange={(val: string) => setFormData({...formData, joinDate: val})} />
                    <Input label="الراتب الأساسي" type="number" placeholder="قيمة الراتب" value={formData.baseSalary || 0} onChange={(val: string) => setFormData({...formData, baseSalary: Number(val)})} />
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600">ملاحظات</label>
                        <textarea 
                            value={formData.notes || ''}
                            placeholder="أي ملاحظات إضافية..."
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-white border border-line rounded-xl p-3 h-24 outline-none focus:border-accent transition-all text-sm"
                        />
                    </div>
                    <button type="submit" className="w-full btn-primary py-4 rounded-xl shadow-sm mt-4">حفظ الموظف</button>
                </form>
            </Modal>
        </div>
    );
};
