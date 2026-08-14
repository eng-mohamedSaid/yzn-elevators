import React from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { LoadingButton } from '../ui/LoadingButton';
import { InlineAlert } from '../ui/InlineAlert';
import { AppError } from '../../services/errors';

interface DownloadRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  range: { from: string; to: string };
  onRangeChange: (range: { from: string; to: string }) => void;
  onDownload: () => void;
  /** Label shown in the description, e.g. "العروض" or "العقود" */
  entityLabel?: string;
  /** True while the file is being generated. */
  isDownloading?: boolean;
  /** Failure raised while generating the file. */
  downloadError?: AppError | null;
}

/**
 * Generic date-range Excel export dialog.
 * Reusable for any entity with a date field.
 */
export const DownloadRangeModal: React.FC<DownloadRangeModalProps> = ({
  isOpen, onClose, range, onRangeChange, onDownload, entityLabel = 'السجلات',
  isDownloading = false, downloadError = null,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`تحميل تقرير ${entityLabel}`} isBusy={isDownloading}>
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

      <InlineAlert error={downloadError} />

      <LoadingButton
        onClick={onDownload}
        isLoading={isDownloading}
        loadingText="جاري تجهيز الملف..."
        spinnerSize={20}
        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
      >
        <Download size={20} /> بدء التحميل الآن
      </LoadingButton>
    </div>
  </Modal>
);
