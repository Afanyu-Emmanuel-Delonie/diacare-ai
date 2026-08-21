import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import Button from './Button.jsx';

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = totalItems === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-[#334155]/15 bg-[#FFFFFF] px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-[#334155]/80">
        Showing {start} to {end} of {totalItems} records
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="pageSize" className="text-sm font-semibold text-[#334155]">
          Rows
        </label>
        <select
          id="pageSize"
          className="min-h-10 rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-2 text-sm text-[#334155]"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <Button
          variant="secondary"
          className="px-2.5"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <MdChevronLeft size={18} />
        </Button>
        <span className="text-sm font-semibold text-[#334155]">
          Page {page + 1} of {safeTotalPages}
        </span>
        <Button
          variant="secondary"
          className="px-2.5"
          disabled={page + 1 >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <MdChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
