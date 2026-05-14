import React from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../Modal';
import { Input } from '../Input';

interface DownloadRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  range: { from: string; to: string };
  onRangeChange: (range: { from: string; to: string }) => void;
  onDownload: () => void;
  /** Label shown in the description, e.g. "العروض" or "العقود" */
  entityLabel?: string;
}

/**
 * Generic date-range Excel export dialog.
 * Reusable for any entity with a date field.
 */
export const DownloadRangeModal: React.FC<DownloadRangeModalProps> = ({
  isOpen, onClose, range, onRangeChange, onDownload, entityLabel = 'السجلات',
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`تحميل تقرير ${entityLabel}`}>
    <div className="space-y-4">
      <p className="text-sm font-medium text-secondary">
        اختر الفترة الزمنية لتحميل كافة {entityLabel} كملف Excel:
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="من تاريخ"
          type="date"
          value={range.from}
          onChange={v => onRangeChange({ ...range, from: v })}
        />
        <Input
          label="إلى تاريخ"
          type="date"
          value={range.to}
          onChange={v => onRangeChange({ ...range, to: v })}
        />
      </div>
      <button
        onClick={onDownload}
        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
      >
        <Download size={20} /> بدء التحميل الآن
      </button>
    </div>
  </Modal>
);
