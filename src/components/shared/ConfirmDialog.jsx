import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title      = 'Are you sure?',
  message    = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  danger     = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon-wrap ${danger ? 'danger' : 'warning'}`}>
          <AlertTriangle size={30} strokeWidth={2} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            <X size={14} /> {cancelLabel}
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            <Trash2 size={14} strokeWidth={2} /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
