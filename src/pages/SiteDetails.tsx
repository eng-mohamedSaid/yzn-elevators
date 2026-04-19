import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, Users, Save, Trash2, Edit3, Map } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Site, SiteSchedule, Worker } from '../types';
import { DetailField } from '../components/DetailField';
import { motion } from 'motion/react';
import { format, eachDayOfInterval, parseISO, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

export const SiteDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [site, setSite] = useState<Site | null>(null);
    const [schedules, setSchedules] = useState<SiteSchedule[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Site>>({});

    useEffect(() => {
        if (id) {
            const siteData = dataService.getById<Site>('sites', id);
            if (siteData) {
                setSite(siteData);
                setFormData(siteData);
                loadSchedules(siteData);
            }
            setWorkers(dataService.getAll<Worker>('workers'));
        }
    }, [id]);

    const loadSchedules = (siteData: Site) => {
        const existingSchedules = dataService.getAll<SiteSchedule>('schedule').filter(s => s.siteId === siteData.id);
        
        if (existingSchedules.length === 0) {
            // Generate rows if none exist
            const days = eachDayOfInterval({
                start: parseISO(siteData.startDate),
                end: parseISO(siteData.endDate)
            });
            
            const newSchedules = days.map(day => ({
                id: crypto.randomUUID(),
                siteId: siteData.id,
                day: format(day, 'EEEE', { locale: ar }),
                date: format(day, 'yyyy-MM-dd'),
                tech1Id: '',
                tech2Id: '',
                worker1Id: '',
                worker2Id: '',
                notes: ''
            }));
            
            setSchedules(newSchedules);
            // Don't save yet until admin clicks Save
        } else {
            setSchedules(existingSchedules.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    };

    const handleSaveSchedule = () => {
        const allSchedule = dataService.getAll<SiteSchedule>('schedule').filter(s => s.siteId !== site?.id);
        localStorage.setItem('alyazen_schedule', JSON.stringify([...allSchedule, ...schedules]));
        alert('تم حفظ الجدول بنجاح');
    };

    const handleUpdateSite = () => {
        if (!site) return;
        dataService.update<Site>('sites', site.id, formData);
        setSite({...site, ...formData} as Site);
        setIsEditMode(false);
    };

    const handleDeleteSite = () => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
            dataService.delete('sites', id!);
            navigate('/sites');
        }
    };

    if (!site) return <div>جاري التحميل...</div>;

    const techs = workers.filter(w => w.role === 'tech');
    const labors = workers.filter(w => w.role === 'worker');

    return (
        <div className="space-y-8 pb-32">
            <button onClick={() => navigate('/sites')} className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-all">
                <ChevronRight size={20} />
                الرجوع للمواقع
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-bg border border-line rounded-2xl flex items-center justify-center text-accent shadow-sm">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <span className="badge badge-success mb-1 inline-block">{site.siteNumber}</span>
                        <h1 className="text-2xl font-bold tracking-tight">{site.siteName}</h1>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setIsEditMode(!isEditMode)} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-line rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-bg transition-colors">
                        <Edit3 size={18} /> {isEditMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
                    </button>
                    <button onClick={handleDeleteSite} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="card bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <DetailField label="العنوان" value={formData.address || ''} isEdit={isEditMode} onChange={v => setFormData({...formData, address: v})} />
                    <DetailField label="تاريخ الاستلام" value={formData.startDate || ''} isEdit={isEditMode} type="date" onChange={v => setFormData({...formData, startDate: v})} />
                    <DetailField label="تاريخ الانتهاء" value={formData.endDate || ''} isEdit={isEditMode} type="date" onChange={v => setFormData({...formData, endDate: v})} />
                    <DetailField label="السعر الإجمالي" value={formData.price || 0} isEdit={isEditMode} type="number" suffix="ر.س" onChange={v => setFormData({...formData, price: Number(v)})} />
                    <div className="col-span-1 sm:col-span-1">
                        <label className="text-[10px] font-bold text-secondary uppercase block mb-1">الموقع على الخريطة</label>
                        {site.mapUrl ? (
                            <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent font-bold text-sm bg-bg border border-line px-4 py-2 rounded-lg w-fit hover:bg-line transition-colors">
                                <Map size={16} /> فتح Google Maps
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-bg border border-line px-4 py-2 rounded-lg w-fit">
                                <Map size={16} /> لا يوجد
                            </div>
                        )}
                    </div>
                </div>
                {isEditMode && (
                    <button onClick={handleUpdateSite} className="mt-8 btn-primary px-8 py-3 rounded-xl shadow-sm">حفظ البيانات</button>
                )}
            </div>

            {/* Daily Schedule Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-accent" />
                        جدول العمل اليومي
                    </h2>
                    <button onClick={handleSaveSchedule} className="btn-primary px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2">
                        <Save size={18} /> حفظ الجدول
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-line shadow-sm">
                    <table className="w-full text-right min-w-[800px] text-sm">
                        <thead className="bg-[#fcfcfc] border-b border-line">
                            <tr>
                                <th className="px-6 py-4 sticky right-0 bg-[#fcfcfc] z-10 w-32 border-l border-line font-bold text-xs text-secondary uppercase">التاريخ</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">اليوم</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-center">الفني الأول</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-center">الفني الثاني</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-center">العامل الأول</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-center">العامل الثاني</th>
                                <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-primary">
                            {schedules.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-all">
                                    <td className="px-6 py-4 font-bold text-xs sticky right-0 bg-white z-10 border-l border-gray-100">{row.date}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{row.day}</td>
                                    <td className="px-2 py-2">
                                        <WorkerSelect 
                                            workers={techs} 
                                            value={row.tech1Id} 
                                            onChange={val => {
                                                const newS = [...schedules];
                                                newS[idx].tech1Id = val;
                                                setSchedules(newS);
                                            }}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <WorkerSelect workers={techs} value={row.tech2Id} onChange={val => { const newS = [...schedules]; newS[idx].tech2Id = val; setSchedules(newS); }} />
                                    </td>
                                    <td className="px-2 py-2">
                                        <WorkerSelect workers={labors} value={row.worker1Id} onChange={val => { const newS = [...schedules]; newS[idx].worker1Id = val; setSchedules(newS); }} />
                                    </td>
                                    <td className="px-2 py-2">
                                        <WorkerSelect workers={labors} value={row.worker2Id} onChange={val => { const newS = [...schedules]; newS[idx].worker2Id = val; setSchedules(newS); }} />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input 
                                            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none"
                                            value={row.notes}
                                            placeholder="ملاحظات..."
                                            onChange={e => { const newS = [...schedules]; newS[idx].notes = e.target.value; setSchedules(newS); }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const WorkerSelect = ({ workers, value, onChange }: { workers: Worker[], value: string, onChange: (val: string) => void }) => (
    <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer"
    >
        <option value="">- لم يحدد -</option>
        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
    </select>
);
