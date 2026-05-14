import React from 'react';
import { Download, Edit3, FileDigit, Trash2 } from 'lucide-react';
import { Offer } from '../../types';
import { Modal } from '../Modal';
import { OfferDetailView } from './OfferDetailView';
import { exportService } from '../../services/exportService';
import { PDF_COLUMNS } from './offerConstants';

interface OfferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  formData: Partial<Offer>;
  onChange: (patch: Partial<Offer>) => void;
  isEditMode: boolean;
  onRequestEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onRequestDelete: () => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  isOpen, onClose, offer, formData, onChange,
  isEditMode, onRequestEdit, onSave, onCancelEdit, onRequestDelete,
}) => {
  if (!offer) return null;

  const footer = (
    <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 w-full text-sm md:text-lg">
      {!isEditMode ? (
        <>
          <button onClick={onRequestEdit} className="bg-accent/10 text-accent font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-accent/20 hover:bg-accent/20 transition-colors">
            <Edit3 size={16} /> <span>تفعيل التعديل</span>
          </button>
          <button
            onClick={() => exportService.toPDF([offer], [...PDF_COLUMNS], 'عرض_سعر')}
            className="bg-primary/5 text-primary font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-line hover:bg-primary/10 transition-colors"
          >
            <Download size={16} /> <span>PDF</span>
          </button>
          <button
            onClick={() => exportService.toWord(offer, 'العرض')}
            className="bg-primary/5 text-primary font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-line hover:bg-primary/10 transition-colors"
          >
            <FileDigit size={16} /> <span>Word</span>
          </button>
          <button onClick={onRequestDelete} className="bg-red-50 text-red-600 font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-red-100 hover:bg-red-100 transition-colors">
            <Trash2 size={16} /> <span>حذف</span>
          </button>
        </>
      ) : (
        <>
          <button onClick={onSave}       className="col-span-2 sm:col-span-auto flex-1 btn-primary py-3 rounded-xl shadow-sm">حفظ التغييرات</button>
          <button onClick={onCancelEdit} className="col-span-2 sm:col-span-auto flex-1 bg-bg text-secondary border border-line font-bold py-3 rounded-xl hover:bg-line transition-colors">إلغاء</button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل بيانات العرض' : 'تفاصيل عرض السعر'}
      size="full"
      footer={footer}
    >
      <OfferDetailView
        offer={offer}
        formData={formData}
        isEditMode={isEditMode}
        onChange={onChange}
      />
    </Modal>
  );
};
