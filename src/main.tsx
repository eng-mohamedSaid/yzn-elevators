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
          { id: crypto.randomUUID(), name: 'خالد محمد', joinDate: '2023-01-10', baseSalary: 5000, role: 'tech', notes: 'خبير صيانة' },
          { id: crypto.randomUUID(), name: 'أحمد علي', joinDate: '2023-05-15', baseSalary: 3500, role: 'worker', notes: '' },
          { id: crypto.randomUUID(), name: 'سعيد حسن', joinDate: '2024-02-01', baseSalary: 5500, role: 'tech', notes: 'تخصص كبائن' }
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

