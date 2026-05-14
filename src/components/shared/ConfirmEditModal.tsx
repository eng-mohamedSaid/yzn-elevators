import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../Modal';

interface ConfirmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Generic "confirm enable edit mode" dialog.
 * Reusable across Offers, Maintenance, Sites, etc.
 */
export const ConfirmEditModal: React.FC<ConfirmEditModalProps> = ({
  isOpen, onClose, onConfirm,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="تأكيد تفعيل التعديل">
    <div className="text-center space-y-4 py-2">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
        <AlertCircle size={32} />
      </div>
      <p className="font-bold text-secondary leading-relaxed">
        هل أنت متأكد من تفعيل وضع التعديل؟<br />
        قد يؤدي تغيير البيانات إلى اختلاف العرض المطبوع سابقاً.
      </p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 btn-primary py-3 rounded-xl">نعم، تفعيل</button>
        <button onClick={onClose}   className="flex-1 bg-bg border border-line py-3 rounded-xl font-bold text-secondary">إلغاء</button>
      </div>
    </div>
  </Modal>
);
