import React, { useEffect, useState } from 'react';
import { FileText, Wrench, MapPin, Users, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { dataService } from '../services/dataService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    offers: 0,
    maintenance: 0,
    sites: 0,
    workers: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    setStats({
      offers: dataService.getAll('offers').length,
      maintenance: dataService.getAll('maintenance').length,
      sites: dataService.getAll('sites').length,
      workers: dataService.getAll('workers').length
    });
  }, []);

  const cards = [
    { title: 'العروض', count: stats.offers, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', path: '/offers' },
    { title: 'الصيانة', count: stats.maintenance, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', path: '/maintenance' },
    { title: 'المواقع', count: stats.sites, icon: MapPin, color: 'text-green-600', bg: 'bg-green-50', path: '/sites' },
    { title: 'الموظفين', count: stats.workers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', path: '/workers' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
        <p className="text-muted text-sm">أهلاً بك في نظام اليزن للمصاعد. إليك ملخص العمل اليوم.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div 
            key={card.title} 
            onClick={() => navigate(card.path)}
            className="bg-white p-6 rounded-xl border border-line shadow-sm cursor-pointer hover:border-accent group transition-all"
          >
            <span className="text-[13px] text-secondary mb-2 block">{card.title}</span>
            <div className="text-2xl font-bold group-hover:text-accent transition-colors">{card.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="table-container bg-white border border-line rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-line">
                <h3 className="font-bold text-lg">آخر العروض</h3>
                <button onClick={() => navigate('/offers')} className="text-xs font-bold text-accent py-1 px-3 border border-accent/20 rounded-md hover:bg-accent/5">عرض الكل</button>
            </div>
            <div className="divide-y divide-line">
                {dataService.getAll<any>('offers').slice(-5).reverse().map(offer => (
                    <div key={offer.id} className="flex justify-between items-center p-6 hover:bg-bg transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                            <span className="font-bold text-sm tracking-tight">{offer.customerName}</span>
                        </div>
                        <span className="text-xs font-bold text-secondary">{offer.offerNumber}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="table-container bg-white border border-line rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-line">
                <h3 className="font-bold text-lg">مواقع العمل النشطة</h3>
                <button onClick={() => navigate('/sites')} className="text-xs font-bold text-accent py-1 px-3 border border-accent/20 rounded-md hover:bg-accent/5">عرض الكل</button>
            </div>
            <div className="divide-y divide-line">
                 {dataService.getAll<any>('sites').slice(-5).reverse().map(site => (
                    <div key={site.id} className="flex justify-between items-center p-6 hover:bg-bg transition-all">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm">{site.siteName}</span>
                            <span className="text-[11px] text-secondary font-medium">{site.startDate} ~ {site.endDate}</span>
                        </div>
                        <span className="text-primary font-bold text-sm">{(site.price || 0).toLocaleString()} ر.س</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
