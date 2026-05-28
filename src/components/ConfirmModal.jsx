export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 fs-5">{message}</p>
          </div>
          <div className="modal-footer border-top-0 bg-light rounded-bottom">
            <button type="button" className="btn btn-light border px-4" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger px-4 fw-bold shadow-sm" onClick={onConfirm}>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
