import React from 'react';
import { Offer } from '../../types';
import { Modal } from '../Modal';
import { OfferFormFields } from './OfferFormFields';

interface AddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Offer>;
  onChange: (patch: Partial<Offer>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddOfferModal: React.FC<AddOfferModalProps> = ({
  isOpen, onClose, formData, onChange, onSubmit,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="إضافة عرض سعر جديد" size="full">
    <form onSubmit={onSubmit} className="space-y-1">
      <OfferFormFields data={formData} onChange={onChange} />
      <div className="flex gap-3 pt-4">
        <button type="submit"   className="flex-1 btn-primary py-4 rounded-xl shadow-sm">إضافة العرض</button>
        <button type="button" onClick={onClose} className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl">إلغاء</button>
      </div>
    </form>
  </Modal>
);
