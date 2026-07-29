import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Seed initial data if empty
const seedData = () => {
  if (!localStorage.getItem('alyazen_auth')) {
    // No auth yet, but we don't seed user (admin123 is hardcoded in login)
  }
  
  if (!localStorage.getItem('alyazen_workers')) {
      const workers = [
          { id: crypto.randomUUID(), name: 'خالد محمد', role: 'مهندس',    salaryType: 'راتب شهري', baseSalary: 5000, joinDate: '2023-01-10', notes: 'خبير صيانة', createdAt: '2023-01-10T00:00:00.000Z' },
          { id: crypto.randomUUID(), name: 'أحمد علي',  role: 'مساعد',    salaryType: 'يومية',     baseSalary: 250,  joinDate: '2023-05-15', notes: '',            createdAt: '2023-05-15T00:00:00.000Z' },
          { id: crypto.randomUUID(), name: 'سعيد حسن',  role: 'فني',      salaryType: 'راتب شهري', baseSalary: 5500, joinDate: '2024-02-01', notes: 'تخصص كبائن', createdAt: '2024-02-01T00:00:00.000Z' },
          { id: crypto.randomUUID(), name: 'محمود سيد', role: 'مساعد أول', salaryType: 'يومية',     baseSalary: 350,  joinDate: '2024-06-01', notes: '',            createdAt: '2024-06-01T00:00:00.000Z' }
      ];
      localStorage.setItem('alyazen_workers', JSON.stringify(workers));
  }
};

seedData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

