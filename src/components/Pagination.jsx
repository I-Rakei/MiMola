export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light mt-auto">
      <span className="small text-muted fw-bold">Page {currentPage} of {totalPages}</span>
      <div className="btn-group btn-group-sm shadow-sm">
        <button 
          className="btn btn-outline-secondary px-3" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button 
          className="btn btn-outline-secondary px-3" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
