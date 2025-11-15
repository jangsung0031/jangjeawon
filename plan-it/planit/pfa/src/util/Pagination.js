import "../css/Pagination.css";

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const maxVisible = 2;

  let startPage = Math.max(2, currentPage - maxVisible);
  let endPage = Math.min(totalPages - 1, currentPage + maxVisible);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>총 {totalPages}페이지 중 {currentPage}페이지</span>
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn prev-next"
          title="이전 페이지"
        >
          ◀
        </button>

        <button
          onClick={() => handlePageChange(1)}
          className={`pagination-btn page-number ${currentPage === 1 ? "active" : ""}`}
        >
          1
        </button>

        {startPage > 2 && <span className="pagination-dots">...</span>}

        {pages.map((num) => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            className={`pagination-btn page-number ${num === currentPage ? "active" : ""}`}
          >
            {num}
          </button>
        ))}

        {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
        
        {!(totalPages === 1) && 
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`pagination-btn page-number ${currentPage === totalPages ? "active" : ""}`}
          >
            {totalPages}
          </button>
        }

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn prev-next"
          title="다음 페이지"
        >
          ▶
        </button>
        
      </div>
    </div>
  );
};

export default Pagination;
