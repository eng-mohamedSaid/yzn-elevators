import React from 'react';
import { Download, Edit3, FileDigit, Trash2 } from 'lucide-react';
import { MaintenanceContract } from '../../types';
import { Modal } from '../Modal';
import { MaintenanceDetailView } from './MaintenanceDetailView';
import { exportService } from '../../services/exportService';
import { MAINTENANCE_PDF_COLUMNS } from './maintenanceConstants';
import { LoadingButton } from '../ui/LoadingButton';
import { InlineAlert } from '../ui/InlineAlert';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { AppError } from '../../services/errors';
import { nextFrame } from '../../lib/nextFrame';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: MaintenanceContract | null;
  formData: Partial<MaintenanceContract>;
  onChange: (patch: Partial<MaintenanceContract>) => void;
  isEditMode: boolean;
  onRequestEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onRequestDelete: () => void;
  /** True while the save request is in flight. */
  isSaving?: boolean;
  /** Failure returned by the save request. */
  saveError?: AppError | null;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  isOpen, onClose, contract, formData, onChange,
  isEditMode, onRequestEdit, onSave, onCancelEdit, onRequestDelete,
  isSaving = false, saveError = null,
}) => {
  // Both exports build the file in the browser and can take a moment on slower
  // devices, so they get the same click-once treatment as the save actions.
  const pdf  = useAsyncAction(async () => { await nextFrame(); exportService.toPDF([contract!], [...MAINTENANCE_PDF_COLUMNS], 'عقد_صيانة'); });
  const word = useAsyncAction(async () => { await exportService.toWord(contract!, 'عقد_صيانة'); });

  if (!contract) return null;

  const isBusy = isSaving || pdf.isPending || word.isPending;

  const footer = (
    <div className="w-full space-y-3">
      <InlineAlert error={saveError ?? pdf.error ?? word.error} />

      <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 w-full text-sm md:text-lg">
        {!isEditMode ? (
          <>
            <button onClick={onRequestEdit} disabled={isBusy} className="bg-accent/10 text-accent font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <Edit3 size={16} /> <span>تفعيل التعديل</span>
            </button>
            <LoadingButton
              onClick={() => pdf.run()}
              isLoading={pdf.isPending}
              loadingText="جاري التحضير..."
              spinnerSize={16}
              disabled={isBusy}
              className="bg-primary/5 text-primary font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-line hover:bg-primary/10 transition-colors"
            >
              <Download size={16} /> <span>PDF</span>
            </LoadingButton>
            <LoadingButton
              onClick={() => word.run()}
              isLoading={word.isPending}
              loadingText="جاري التحضير..."
              spinnerSize={16}
              disabled={isBusy}
              className="bg-primary/5 text-primary font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-line hover:bg-primary/10 transition-colors"
            >
              <FileDigit size={16} /> <span>Word</span>
            </LoadingButton>
            <button onClick={onRequestDelete} disabled={isBusy} className="bg-red-50 text-red-600 font-bold px-1 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <Trash2 size={16} /> <span>حذف</span>
            </button>
          </>
        ) : (
          <>
            <LoadingButton
              onClick={onSave}
              isLoading={isSaving}
              loadingText="جاري الحفظ..."
              className="col-span-2 sm:col-span-auto flex-1 btn-primary py-3 rounded-xl shadow-sm"
            >
              حفظ التغييرات
            </LoadingButton>
            <button
              onClick={onCancelEdit}
              disabled={isSaving}
              className="col-span-2 sm:col-span-auto flex-1 bg-bg text-secondary border border-line font-bold py-3 rounded-xl hover:bg-line transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'تعديل بيانات العقد' : 'تفاصيل عقد الصيانة'}
      size="full"
      isBusy={isBusy}
      footer={footer}
    >
      <MaintenanceDetailView
        contract={contract}
        formData={formData}
        isEditMode={isEditMode}
        onChange={onChange}
      />
    </Modal>
  );
};
