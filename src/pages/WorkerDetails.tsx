import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Calendar, DollarSign, Printer, Save, Trash2, Edit3, Briefcase } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Worker, AttendanceRecord } from '../types';
import { DetailField } from '../components/DetailField';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export const WorkerDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Worker>>({});
    
    // Filtering
    const [dateRange, setDateRange] = useState({
        from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (id) {
            const workerData = dataService.getById<Worker>('workers', id);
            if (workerData) {
                setWorker(workerData);
                setFormData(workerData);
                loadAttendance(workerData.id);
            }
        }
    }, [id, dateRange]);

    const loadAttendance = (workerId: string) => {
        const allAttendance = dataService.getAll<AttendanceRecord>('attendance').filter(a => 
            a.workerId === workerId && 
            a.date >= dateRange.from && 
            a.date <= dateRange.to
        );
        
        // Ensure every day in range has a row
        const days = eachDayOfInterval({
            start: parseISO(dateRange.from),
            end: parseISO(dateRange.to)
        });
        
        const finalAttendance = days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const existing = allAttendance.find(a => a.date === dateStr);
            return existing || {
                id: crypto.randomUUID(),
                workerId,
                day: format(day, 'EEEE', { locale: ar }),
                date: dateStr,
                status: 'present',
                location: '',
                bonus: 0,
                deduction: 0
            } as AttendanceRecord;
        });
        
        setAttendance(finalAttendance);
    };

    const handleSaveAttendance = () => {
        const otherAttendance = dataService.getAll<AttendanceRecord>('attendance').filter(a => 
            !(a.workerId === id && a.date >= dateRange.from && a.date <= dateRange.to)
        );
        localStorage.setItem('alyazen_attendance', JSON.stringify([...otherAttendance, ...attendance]));
        alert('تم حفظ سجل الحضور بنجاح');
    };

    const handleUpdateWorker = () => {
        if (!worker) return;
        dataService.update<Worker>('workers', worker.id, formData);
        setWorker({...worker, ...formData} as Worker);
        setIsEditMode(false);
    };

    const totalBonus = attendance.reduce((sum, r) => sum + r.bonus, 0);
    const totalDeduction = attendance.reduce((sum, r) => sum + r.deduction, 0);
    const netSalary = (worker?.baseSalary || 0) + totalBonus - totalDeduction;

    if (!worker) return <div>جاري التحميل...</div>;

    return (
        <div className="space-y-8 pb-32">
            <button onClick={() => navigate('/workers')} className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-all">
                <ChevronRight size={20} />
                الرجوع للموظفين
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white border border-line rounded-2xl flex items-center justify-center text-accent shadow-sm">
                        <Users size={32} />
                    </div>
                    <div>
                        <span className={`badge mb-1 inline-block ${worker.role === 'tech' ? 'badge-success' : 'badge-warning'}`}>
                            {worker.role === 'tech' ? 'فني مصاعد' : 'عامل مساعد'}
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight">{worker.name}</h1>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                     <button onClick={() => setIsEditMode(!isEditMode)} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-line rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-bg transition-colors">
                        <Edit3 size={18} /> {isEditMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
                    </button>
                    <button className="bg-primary text-white p-3 rounded-xl shadow-sm border border-primary hover:opacity-90 transition-opacity">
                        <Printer size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 card bg-white space-y-6 self-start">
                    <h3 className="font-bold flex items-center gap-2 text-secondary text-xs uppercase tracking-widest">
                        <Briefcase size={14} className="text-accent" /> البيانات الشخصية
                    </h3>
                    <div className="space-y-4">
                        <DetailField label="تاريخ الانضمام" value={formData.joinDate || ''} isEdit={isEditMode} type="date" onChange={(v) => setFormData({...formData, joinDate: v})} />
                        <DetailField label="الراتب الأساسي" value={formData.baseSalary || 0} isEdit={isEditMode} type="number" suffix="ر.س" onChange={(v) => setFormData({...formData, baseSalary: Number(v)})} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-secondary uppercase">ملاحظات</label>
                            {isEditMode ? (
                                <textarea 
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className="w-full bg-bg border border-line p-2 rounded-lg h-24 text-sm outline-none focus:border-accent transition-colors"
                                />
                            ) : (
                                <div className="text-sm font-medium">{worker.notes || 'لا توجد ملاحظات'}</div>
                            )}
                        </div>
                    </div>
                    {isEditMode && (
                        <button onClick={handleUpdateWorker} className="w-full btn-primary py-3 rounded-xl shadow-sm">حفظ التعديلات</button>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Calendar className="text-accent" />
                            سجل الحضور والراتب
                        </h2>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-line shadow-sm">
                            <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="text-xs font-bold outline-none bg-transparent" />
                            <span className="text-line">|</span>
                            <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="text-xs font-bold outline-none bg-transparent" />
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-white rounded-xl border border-line shadow-sm">
                         <table className="w-full text-right min-w-[700px] text-sm">
                            <thead className="bg-[#fcfcfc] border-b border-line">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">اليوم</th>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">التاريخ</th>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">الحالة</th>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">المكان</th>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-green-600">إضافي (+)</th>
                                    <th className="px-6 py-4 font-bold text-xs text-secondary uppercase text-red-600">خصم (-)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line text-primary">
                                {attendance.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-bg transition-colors">
                                        <td className="px-6 py-3 font-medium">{row.day}</td>
                                        <td className="px-6 py-3 text-[11px] text-secondary font-bold">{row.date}</td>
                                        <td className="px-2 py-2">
                                            <select 
                                                value={row.status}
                                                onChange={e => { const newA = [...attendance]; newA[idx].status = e.target.value as any; setAttendance(newA); }}
                                                className={`text-[11px] font-bold px-2 py-1 rounded-full outline-none border border-line ${row.status === 'present' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}
                                            >
                                                <option value="present">حاضر</option>
                                                <option value="absent">غائب</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                className="w-full bg-transparent border-b border-transparent focus:border-accent/30 py-1 text-xs outline-none"
                                                value={row.location}
                                                onChange={e => { const newA = [...attendance]; newA[idx].location = e.target.value; setAttendance(newA); }}
                                                placeholder="الموقع..."
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number"
                                                className="w-16 bg-transparent text-green-600 font-bold text-xs outline-none"
                                                value={row.bonus}
                                                onChange={e => { const newA = [...attendance]; newA[idx].bonus = Number(e.target.value); setAttendance(newA); }}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number"
                                                className="w-16 bg-transparent text-red-600 font-bold text-xs outline-none"
                                                value={row.deduction}
                                                onChange={e => { const newA = [...attendance]; newA[idx].deduction = Number(e.target.value); setAttendance(newA); }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-primary text-white font-bold">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4">الإجمالي المستحق للفترة المحددة</td>
                                    <td className="px-6 py-4 text-left font-sans" colSpan={4}>
                                        <div className="flex justify-end gap-6 items-center">
                                            <span className="text-green-400 font-mono">+{totalBonus}</span>
                                            <span className="text-red-400 font-mono">-{totalDeduction}</span>
                                            <span className="text-secondary/60 ml-2 uppercase text-[10px]">صافي الراتب:</span>
                                            <span className="text-xl font-mono text-accent">{(netSalary || 0).toLocaleString()} ريال</span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                         </table>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveAttendance} className="btn-primary flex items-center gap-2 shadow-sm">
                            <Save size={20} /> حفظ سجل الحضور
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
