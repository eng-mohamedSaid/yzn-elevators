import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Optional entity label shown in the message, e.g. "العرض" or "العقد" */
  entityLabel?: string;
}

/**
 * Generic "confirm permanent delete" dialog.
 * Reusable across Offers, Maintenance, Sites, Workers, etc.
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen, onClose, onConfirm, entityLabel = 'هذا السجل',
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="تأكيد الحذف">
    <div className="text-center space-y-4 py-2">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
        <Trash2 size={32} />
      </div>
      <p className="font-bold text-secondary leading-relaxed">
        هل أنت متأكد من حذف {entityLabel} نهائياً؟<br />
        <span className="text-red-500">لا يمكن استعادة البيانات المحذوفة.</span>
      </p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">نعم، حذف نهائياً</button>
        <button onClick={onClose}   className="flex-1 bg-bg border border-line py-3 rounded-xl font-bold text-secondary">إلغاء</button>
      </div>
    </div>
  </Modal>
);
