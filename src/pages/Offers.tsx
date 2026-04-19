import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Trash2, Edit3, ChevronRight, Calendar, MapPin, ExternalLink, ShieldCheck, AlertCircle, FileDigit } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Offer } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { DetailField } from '../components/DetailField';
import { exportService } from '../services/exportService';
import { format, isWithinInterval, parseISO } from 'date-fns';

const ELEVATOR_TYPES = ['عادي', 'هايدروليك', 'جيرليس عادي', 'جيرليس اتوماتيك', 'وايدرامب', 'باكدج', 'طعام', 'بانوراما', 'بضاعة'];
const MACHINE_TYPES = ['ايطالي', 'سيكور', 'البرتوساسي', 'بريمو', 'موتوناري', 'ايطال جير', 'جي ام', 'جي ام في', 'موريس', 'تيسن'];
const CONTROL_BOARDS = ['كاس', 'التامترو', 'الترونيك', 'لاب ستار', 'فيجا', 'تركي'];
const BATTERIES = ['UPS', 'بطارية طوارئ', 'لا يوجد'];
const VVVFS = ['شنايدر', 'اسكاوا', 'جيفرن', 'دلتا', 'صانشي', 'اينفت'];
const RAILS = ['5 مم', '9 مم', '16 مم'];
const REMOVAL_OPTIONS = ['يوجد', 'لا يوجد'];

export const Offers: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'customerName' | 'phone' | 'offerNumber' | 'address'>('customerName');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isDownloadRangeOpen, setIsDownloadRangeOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Download Range State
    const [downloadRange, setDownloadRange] = useState({ 
        from: format(new Date(), 'yyyy-MM-01'), 
        to: format(new Date(), 'yyyy-MM-dd') 
    });

    // Form State
    const [formData, setFormData] = useState<Partial<Offer>>({
        customerName: '',
        phone: '',
        address: '',
        locationUrl: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        customerType: 'client',
        elevatorType: ELEVATOR_TYPES[0],
        elevatorCount: 1,
        stops: 0,
        floors: 0,
        entrances: 1,
        load: '',
        machineType: MACHINE_TYPES[0],
        controlBoard: CONTROL_BOARDS[0],
        battery: BATTERIES[0],
        vvvf: VVVFS[0],
        payment1: 0,
        payment2: 0,
        payment3: 0,
        payment4: 0,
        doorType: '',
        innerDoor: '',
        doorSize: 0,
        pitWidth: 0,
        lastFloorHeight: 0,
        pitDepth: 0,
        pitLength: 0,
        counterweightPosition: '',
        cabinSize: '',
        price: 0,
        note1: '',
        note2: '',
        note3: '',
        representative: '',
        engNotes1: '',
        engNotes2: '',
        oldElevatorRemoval: 'لا يوجد',
        rails: RAILS[0]
    });

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = () => {
        const data = dataService.getAll<Offer>('offers');
        setOffers(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = dataService.search<Offer>('offers', query, [searchType]);
        setOffers(filtered);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const offerCount = dataService.getAll<Offer>('offers').length + 1;
        const offerNumber = `OFF-${String(offerCount).padStart(4, '0')}`;
        
        dataService.create<Offer>('offers', {
            ...formData as Offer,
            offerNumber,
            createdAt: new Date().toISOString()
        });
        
        loadOffers();
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleUpdate = () => {
        if (!selectedOffer) return;
        dataService.update<Offer>('offers', selectedOffer.id, formData);
        loadOffers();
        setIsEditMode(false);
        const updated = dataService.getById<Offer>('offers', selectedOffer.id);
        if (updated) setSelectedOffer(updated);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذه العملية.')) {
            dataService.delete('offers', id);
            loadOffers();
            setIsDetailModalOpen(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            phone: '',
            address: '',
            locationUrl: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            customerType: 'client',
            elevatorType: ELEVATOR_TYPES[0],
            elevatorCount: 1,
            stops: 0,
            floors: 0,
            entrances: 1,
            load: '',
            machineType: MACHINE_TYPES[0],
            controlBoard: CONTROL_BOARDS[0],
            battery: BATTERIES[0],
            vvvf: VVVFS[0],
            payment1: 0,
            payment2: 0,
            payment3: 0,
            payment4: 0,
            doorType: '',
            innerDoor: '',
            doorSize: 0,
            pitWidth: 0,
            lastFloorHeight: 0,
            pitDepth: 0,
            pitLength: 0,
            counterweightPosition: '',
            cabinSize: '',
            price: 0,
            note1: '',
            note2: '',
            note3: '',
            representative: '',
            engNotes1: '',
            engNotes2: '',
            oldElevatorRemoval: 'لا يوجد',
            rails: RAILS[0]
        });
    };

    const handleDownloadReport = () => {
        const filtered = offers.filter(o => 
            isWithinInterval(parseISO(o.date), { 
                start: parseISO(downloadRange.from), 
                end: parseISO(downloadRange.to) 
            })
        );
        exportService.toExcel(filtered, 'عروض_الأسعار');
        setIsDownloadRangeOpen(false);
    };

    const openOfferDetails = (offer: Offer) => {
        setSelectedOffer(offer);
        setFormData(offer);
        setIsDetailModalOpen(true);
        setIsEditMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-1">
                    <FileText className="text-accent" />
                    عروض الأسعار
                </h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsDownloadRangeOpen(true)}
                        className="flex-1 sm:flex-none bg-white border border-line text-secondary font-bold px-3 sm:px-4 py-2 sm:py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-bg transition-colors"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">تحميل العروض</span>
                    </button>
                    <button 
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 shadow-sm px-3 sm:px-4"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">عرض</span>
                    </button>
                </div>
            </div>

            {/* Sticky/Scrollable Chips Header */}
            <div className="chips-row">
                {[
                    { label: 'الاسم', key: 'customerName' },
                    { label: 'رقم العرض', key: 'offerNumber' },
                    { label: 'التليفون', key: 'phone' },
                    { label: 'العنوان', key: 'address' }
                ].map(type => (
                    <button
                        key={type.key}
                        onClick={() => setSearchType(type.key as any)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all border ${
                            searchType === type.key 
                                ? 'bg-secondary text-white border-secondary' 
                                : 'bg-white text-gray-500 border-gray-200'
                        }`}
                    >
                        بحث بـ {type.label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder={`ابحث عن عرض بـ ${searchType === 'customerName' ? 'اسم العميل' : searchType === 'offerNumber' ? 'رقم العرض' : searchType === 'phone' ? 'رقم التليفون' : 'العنوان'}...`}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 sm:py-4 pr-11 sm:pr-12 pl-3 sm:pl-4 focus:border-primary outline-none shadow-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <div className="hidden sm:block overflow-hidden bg-white rounded-xl border border-line shadow-sm">
                <table className="w-full text-right">
                    <thead className="bg-[#fcfcfc] border-b border-line">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">رقم العرض</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">اسم العميل</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">التليفون</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">العنوان</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">التاريخ</th>
                            <th className="px-6 py-4 font-bold text-xs text-secondary uppercase">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {offers.map(offer => (
                            <tr 
                                key={offer.id} 
                                onClick={() => openOfferDetails(offer)}
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

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {offers.map(offer => (
                    <div 
                        key={offer.id} 
                        onClick={() => openOfferDetails(offer)}
                        className="card space-y-3 active:scale-95 transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="badge badge-success mb-2 inline-block">
                                    {offer.offerNumber}
                                </span>
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

            {/* Modals Implementation */}
            <Modal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              title="إضافة عرض سعر جديد"
              size="lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="اسم العميل" placeholder="أدخل اسم العميل بالكامل" value={formData.customerName} onChange={val => setFormData({...formData, customerName: val})} />
                <Input label="رقم التليفون" type="number" placeholder="مثال: 01xxxxxxxxx" value={formData.phone} onChange={val => setFormData({...formData, phone: val})} />
                <Input label="العنوان" placeholder="أدخل عنوان العميل" value={formData.address} onChange={val => setFormData({...formData, address: val})} />
                <Input label="رابط الموقع" placeholder="رابط Google Maps" value={formData.locationUrl} onChange={val => setFormData({...formData, locationUrl: val})} />
                <Input label="التاريخ" type="date" placeholder="اختر التاريخ" value={formData.date} onChange={val => setFormData({...formData, date: val})} />
                
                <Select label="نوع العميل" placeholder="اختر نوع العميل" options={['client', 'company']} value={formData.customerType} onChange={val => setFormData({...formData, customerType: val as any})} />
                <Select label="نوع المصعد" placeholder="اختر نوع المصعد" options={ELEVATOR_TYPES} value={formData.elevatorType} onChange={val => setFormData({...formData, elevatorType: val})} />
                
                <Input label="عدد المصاعد" type="number" placeholder="ادخل العدد" value={formData.elevatorCount} onChange={val => setFormData({...formData, elevatorCount: Number(val)})} />
                <Input label="الوقفات" type="number" placeholder="عدد الوقفات" value={formData.stops} onChange={val => setFormData({...formData, stops: Number(val)})} />
                <Input label="الطوابق" type="number" placeholder="عدد الطوابق" value={formData.floors} onChange={val => setFormData({...formData, floors: Number(val)})} />
                <Input label="المداخل" type="number" placeholder="عدد المداخل" value={formData.entrances} onChange={val => setFormData({...formData, entrances: Number(val)})} />
                <Input label="الحمولة" placeholder="مثال: 450 كجم" value={formData.load} onChange={val => setFormData({...formData, load: val})} />
                
                <Select label="نوع الماكينة" placeholder="اختر الماكينة" options={MACHINE_TYPES} value={formData.machineType} onChange={val => setFormData({...formData, machineType: val})} />
                <Select label="كارت الكنترول" placeholder="اختر الكارت" options={CONTROL_BOARDS} value={formData.controlBoard} onChange={val => setFormData({...formData, controlBoard: val})} />
                <Select label="البطارية" placeholder="اختر البطارية" options={BATTERIES} value={formData.battery} onChange={val => setFormData({...formData, battery: val})} />
                <Select label="VVVF" placeholder="اختر النوع" options={VVVFS} value={formData.vvvf} onChange={val => setFormData({...formData, vvvf: val})} />
                
                <Input label="دفعة 1" type="number" placeholder="المبلغ" value={formData.payment1} onChange={val => setFormData({...formData, payment1: Number(val)})} />
                <Input label="دفعة 2" type="number" placeholder="المبلغ" value={formData.payment2} onChange={val => setFormData({...formData, payment2: Number(val)})} />
                <Input label="دفعة 3" type="number" placeholder="المبلغ" value={formData.payment3} onChange={val => setFormData({...formData, payment3: Number(val)})} />
                <Input label="دفعة 4" type="number" placeholder="المبلغ" value={formData.payment4} onChange={val => setFormData({...formData, payment4: Number(val)})} />
                
                <Input label="نوع الباب" placeholder="مثال: نصف اتوماتيك" value={formData.doorType} onChange={val => setFormData({...formData, doorType: val})} />
                <Input label="الباب الداخلي" placeholder="مثال: اتوماتيك" value={formData.innerDoor} onChange={val => setFormData({...formData, innerDoor: val})} />
                <Input label="مقاس الباب" type="number" placeholder="بالسم" value={formData.doorSize} onChange={val => setFormData({...formData, doorSize: Number(val)})} />
                
                <Input label="عرض البئر" type="number" placeholder="بالسم" value={formData.pitWidth} onChange={val => setFormData({...formData, pitWidth: Number(val)})} />
                <Input label="ارتفاع الدور الأخير" type="number" placeholder="بالمتر" value={formData.lastFloorHeight} onChange={val => setFormData({...formData, lastFloorHeight: Number(val)})} />
                <Input label="حفرة البئر" type="number" placeholder="بالسم" value={formData.pitDepth} onChange={val => setFormData({...formData, pitDepth: Number(val)})} />
                <Input label="طول البئر" type="number" placeholder="بالسم" value={formData.pitLength} onChange={val => setFormData({...formData, pitLength: Number(val)})} />
                <Input label="مكان الثقال" placeholder="مثال: خلف" value={formData.counterweightPosition} onChange={val => setFormData({...formData, counterweightPosition: val})} />
                <Input label="مقاس الكابينة" placeholder="عرض x طول" value={formData.cabinSize} onChange={val => setFormData({...formData, cabinSize: val})} />
                
                <Input label="السعر" type="number" placeholder="دخل السعر الإجمالي" value={formData.price} onChange={val => setFormData({...formData, price: Number(val)})} suffix="جنيه" />
                <Input label="المندوب" placeholder="اسم المندوب" value={formData.representative} onChange={val => setFormData({...formData, representative: val})} />
                
                <Select label="فك المصعد القديم" placeholder="هل يوجد فك؟" options={REMOVAL_OPTIONS} value={formData.oldElevatorRemoval} onChange={val => setFormData({...formData, oldElevatorRemoval: val as any})} />
                <Select label="قضبان" placeholder="اختر نوع القضبان" options={RAILS} value={formData.rails} onChange={val => setFormData({...formData, rails: val})} />

                <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-line pt-4 mt-2">
                    <DetailField label="ملاحظة 1" value={formData.note1} isEdit={true} type="textarea" onChange={v => setFormData({...formData, note1: v})} />
                    <DetailField label="ملاحظة 2" value={formData.note2} isEdit={true} type="textarea" onChange={v => setFormData({...formData, note2: v})} />
                    <DetailField label="ملاحظة 3" value={formData.note3} isEdit={true} type="textarea" onChange={v => setFormData({...formData, note3: v})} />
                </div>
                
                <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailField label="ملاحظات المهندس 1" value={formData.engNotes1} isEdit={true} type="textarea" onChange={v => setFormData({...formData, engNotes1: v})} />
                    <DetailField label="ملاحظات المهندس 2" value={formData.engNotes2} isEdit={true} type="textarea" onChange={v => setFormData({...formData, engNotes2: v})} />
                </div>

                <div className="col-span-1 sm:col-span-3 mt-6 flex gap-3">
                   <button onClick={handleCreate} className="flex-1 btn-primary py-4 rounded-xl shadow-sm">إضافة العرض</button>
                   <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl">إلغاء</button>
                </div>
              </div>
            </Modal>

            {/* Offer Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={isEditMode ? "تعديل بيانات العرض" : "تفاصيل عرض السعر"}
                size="full"
                footer={
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 w-full">
                        {!isEditMode ? (
                            <>
                                <button 
                                    onClick={() => setIsConfirmEditOpen(true)} 
                                    className="bg-accent/10 text-accent font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 border border-accent/20 hover:bg-accent/20 transition-colors"
                                >
                                    <Edit3 size={16} /> <span className="hidden sm:inline">تفعيل التعديل</span>
                                </button>
                                <button 
                                    onClick={() => exportService.toPDF([selectedOffer], [
                                        { header: 'رقم العرض', dataKey: 'offerNumber' },
                                        { header: 'اسم العميل', dataKey: 'customerName' },
                                        { header: 'التليفون', dataKey: 'phone' },
                                        { header: 'العنوان', dataKey: 'address' },
                                        { header: 'المصعد', dataKey: 'elevatorType' },
                                        { header: 'السعر', dataKey: 'price' }
                                    ], 'عرض_سعر')}
                                    className="bg-primary/5 text-primary font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 border border-line hover:bg-primary/10 transition-colors"
                                >
                                    <Download size={16} /> <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button 
                                    onClick={() => exportService.toWord(selectedOffer!, 'العرض')}
                                    className="bg-primary/5 text-primary font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 border border-line hover:bg-primary/10 transition-colors"
                                >
                                    <FileDigit size={16} /> <span className="hidden sm:inline">Word</span>
                                </button>
                                <button 
                                    onClick={() => setIsConfirmDeleteOpen(true)} 
                                    className="bg-red-50 text-red-600 font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-colors sm:mr-auto col-span-2 sm:col-span-auto"
                                >
                                    <Trash2 size={16} /> <span className="hidden sm:inline">حذف</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleUpdate} 
                                    className="col-span-2 sm:col-span-auto flex-1 btn-primary py-3 rounded-xl shadow-sm"
                                >
                                    حفظ التغييرات
                                </button>
                                <button 
                                    onClick={() => setIsEditMode(false)} 
                                    className="col-span-2 sm:col-span-auto flex-1 bg-bg text-secondary border border-line font-bold py-3 rounded-xl hover:bg-line transition-colors"
                                >
                                    إلغاء
                                </button>
                            </>
                        )}
                    </div>
                }
            >
                {selectedOffer && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-1">
                        <DetailField label="رقم العرض" value={selectedOffer.offerNumber} isEdit={false} className="sm:col-span-1" />
                        <DetailField label="اسم العميل" value={formData.customerName} isEdit={isEditMode} onChange={val => setFormData({...formData, customerName: val})} className="sm:col-span-1" />
                        <DetailField label="التليفون" value={formData.phone} isEdit={isEditMode} onChange={val => setFormData({...formData, phone: val})} className="sm:col-span-1" />
                        <DetailField label="العنوان" value={formData.address} isEdit={isEditMode} onChange={val => setFormData({...formData, address: val})} className="sm:col-span-1" />
                        
                        <div className="sm:col-span-1 space-y-1">
                            <label className="text-[10px] font-bold text-secondary uppercase">الموقع</label>
                            {isEditMode ? (
                                <input className="w-full bg-white border border-accent/30 rounded-lg p-2 text-sm" value={formData.locationUrl} onChange={e => setFormData({...formData, locationUrl: e.target.value})} />
                            ) : (
                                <a href={selectedOffer.locationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-accent/5 text-accent p-2 rounded-lg text-sm font-bold border border-accent/10">
                                    <MapPin size={14} /> فتح الخريطة
                                </a>
                            )}
                        </div>

                        <DetailField label="التاريخ" value={formData.date} isEdit={isEditMode} type="date" onChange={val => setFormData({...formData, date: val})} />
                        <DetailField label="نوع العميل" value={formData.customerType} isEdit={isEditMode} type="select" options={['client', 'company']} onChange={val => setFormData({...formData, customerType: val as any})} />
                        <DetailField label="نوع المصعد" value={formData.elevatorType} isEdit={isEditMode} type="select" options={ELEVATOR_TYPES} onChange={val => setFormData({...formData, elevatorType: val})} />
                        
                        <DetailField label="عدد المصاعد" value={formData.elevatorCount} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, elevatorCount: Number(val)})} />
                        <DetailField label="الوقفات" value={formData.stops} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, stops: Number(val)})} />
                        <DetailField label="الطوابق" value={formData.floors} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, floors: Number(val)})} />
                        <DetailField label="المداخل" value={formData.entrances} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, entrances: Number(val)})} />
                        <DetailField label="الحمولة" value={formData.load} isEdit={isEditMode} onChange={val => setFormData({...formData, load: val})} />

                        <DetailField label="الماكينة" value={formData.machineType} isEdit={isEditMode} type="select" options={MACHINE_TYPES} onChange={val => setFormData({...formData, machineType: val})} />
                        <DetailField label="الكنترول" value={formData.controlBoard} isEdit={isEditMode} type="select" options={CONTROL_BOARDS} onChange={val => setFormData({...formData, controlBoard: val})} />
                        <DetailField label="البطارية" value={formData.battery} isEdit={isEditMode} type="select" options={BATTERIES} onChange={val => setFormData({...formData, battery: val})} />
                        <DetailField label="VVVF" value={formData.vvvf} isEdit={isEditMode} type="select" options={VVVFS} onChange={val => setFormData({...formData, vvvf: val})} />

                        <DetailField label="دفعة 1" value={formData.payment1} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, payment1: Number(val)})} />
                        <DetailField label="دفعة 2" value={formData.payment2} isEdit={isEditMode} type="number" onChange={val => setFormData({...formData, payment2: Number(val)})} />
                        <DetailField label="السعر" value={formData.price} isEdit={isEditMode} type="number" suffix="جنيه" onChange={val => setFormData({...formData, price: Number(val)})} className="sm:col-span-2" />

                        <DetailField label="ملاحظة 1" value={formData.note1} isEdit={isEditMode} type="textarea" onChange={val => setFormData({...formData, note1: val})} className="sm:col-span-2" />
                        <DetailField label="ملاحظات المهندس" value={formData.engNotes1} isEdit={isEditMode} type="textarea" onChange={val => setFormData({...formData, engNotes1: val})} className="sm:col-span-2" />
                    </div>
                )}
            </Modal>

            {/* Confirmation Modals */}
            <Modal isOpen={isConfirmEditOpen} onClose={() => setIsConfirmEditOpen(false)} title="تأكيد تفعيل التعديل">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                        <AlertCircle size={32} />
                    </div>
                    <p className="font-bold text-secondary">هل أنت متأكد من تفعيل وضع التعديل؟ قد يؤدي تغيير البيانات إلى اختلاف العرض المطبوع سابقاً.</p>
                    <div className="flex gap-3">
                        <button onClick={() => { setIsEditMode(true); setIsConfirmEditOpen(false); }} className="flex-1 btn-primary py-3 rounded-xl">نعم، تفعيل</button>
                        <button onClick={() => setIsConfirmEditOpen(false)} className="flex-1 bg-bg border border-line py-3 rounded-xl">إلغاء</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="تأكيد الحذف">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <Trash2 size={32} />
                    </div>
                    <p className="font-bold text-secondary">هل أنت متأكد من حذف هذا العرض نهائياً؟ لا يمكن استعادة البيانات المحذوفة.</p>
                    <div className="flex gap-3">
                        <button onClick={() => {
                            if (selectedOffer) {
                                dataService.delete('offers', selectedOffer.id);
                                loadOffers();
                                setIsConfirmDeleteOpen(false);
                                setIsDetailModalOpen(false);
                            }
                        }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl">نعم، حذف نهائياً</button>
                        <button onClick={() => setIsConfirmDeleteOpen(false)} className="flex-1 bg-bg border border-line py-3 rounded-xl">إلغاء</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDownloadRangeOpen} onClose={() => setIsDownloadRangeOpen(false)} title="تحميل تقرير العروض">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-secondary">اختر الفترة الزمنية لتحميل كافة العروض كملف Excel:</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="من تاريخ" type="date" value={downloadRange.from} onChange={v => setDownloadRange({...downloadRange, from: v})} />
                        <Input label="إلى تاريخ" type="date" value={downloadRange.to} onChange={v => setDownloadRange({...downloadRange, to: v})} />
                    </div>
                    <button onClick={handleDownloadReport} className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2">
                        <Download size={20} /> بدء التحميل الآن
                    </button>
                </div>
            </Modal>
        </div>
    );
};
