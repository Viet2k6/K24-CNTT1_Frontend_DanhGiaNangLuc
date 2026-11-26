import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import useProductSearch from '../hooks/useProductSearch.js';
import ProductTable from '../components/ProductTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ProductListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc các giá trị từ URL Search Params (Mục 4.3.3)
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const statusParam = searchParams.get('status') || '';

  // Xử lý trường hợp biên cho page: không hợp lệ hoặc < 1 thì đưa về trang 1
  let pageParam = parseInt(searchParams.get('page') || '1', 10);
  if (isNaN(pageParam) || pageParam < 1) {
    pageParam = 1;
  }

  // State cục bộ cho ô tìm kiếm để hỗ trợ debounce 400ms (Mục 4.3.1)
  const [searchInput, setSearchInput] = useState(qParam);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal xoá sản phẩm & Toast
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(location.state?.toast || null);

  // Tự ẩn toast sau 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Đồng bộ searchInput khi URL thay đổi (hỗ trợ bấm Back/Forward của trình duyệt)
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Debounce ô tìm kiếm 400ms: chỉ cập nhật URL sau khi người dùng ngừng gõ 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== qParam) {
        const next = new URLSearchParams(searchParams);
        if (trimmed) {
          next.set('q', trimmed);
        } else {
          next.delete('q');
        }
        next.set('page', '1'); // Đổi từ khoá thì quay về trang 1
        setSearchParams(next);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, qParam, searchParams, setSearchParams]);

  // Tải danh mục cho bộ lọc category
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    }
    loadCategories();
  }, []);

  // Gọi hook useProductSearch đã sửa với AbortController (Mục 4.3.4)
  const {
    data: products,
    total,
    loading,
    error,
    setData,
    setTotal,
  } = useProductSearch({
    q: qParam,
    category: categoryParam,
    status: statusParam,
    page: pageParam,
    limit: 10,
    refreshKey,
  });

  // Tính tổng số trang (10 sản phẩm mỗi trang, Mục 4.3.2)
  const totalPages = Math.max(1, Math.ceil(total / 10));

  // Xử lý trường hợp biên: nếu số trang trên URL lớn hơn tổng số trang hiện có (ví dụ page=999)
  useEffect(() => {
    if (!loading && total > 0 && pageParam > totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(totalPages));
      setSearchParams(next);
    }
  }, [loading, total, totalPages, pageParam, searchParams, setSearchParams]);

  // Xử lý thay đổi bộ lọc danh mục
  const handleCategoryChange = (e) => {
    const next = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val) {
      next.set('category', val);
    } else {
      next.delete('category');
    }
    next.set('page', '1'); // Đổi bộ lọc thì quay về trang 1
    setSearchParams(next);
  };

  // Xử lý thay đổi bộ lọc trạng thái
  const handleStatusChange = (e) => {
    const next = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val) {
      next.set('status', val);
    } else {
      next.delete('status');
    }
    next.set('page', '1'); // Đổi bộ lọc thì quay về trang 1
    setSearchParams(next);
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  // Xử lý xoá sản phẩm
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setData((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setToast('Đã xoá sản phẩm');
      setDeletingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi xoá sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Toast thông báo */}
      {toast && (
        <div className="toast" data-testid="toast">
          {toast}
        </div>
      )}

      {/* Header trang */}
      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="add-button"
          onClick={() => navigate('/products/new')}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc (Mục 4.3.1) */}
      <div className="filters-toolbar">
        {/* Ô tìm kiếm */}
        <div className="filter-item search-item">
          <input
            type="text"
            className="form-input"
            data-testid="search-input"
            placeholder="Tìm theo tên hoặc SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Bộ lọc danh mục */}
        <div className="filter-item">
          <select
            className="form-input"
            data-testid="category-filter"
            value={categoryParam}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="filter-item">
          <select
            className="form-input"
            data-testid="status-filter"
            value={statusParam}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Trạng thái đang tải */}
      {loading && (
        <div className="status-box loading-box" data-testid="loading">
          Đang tải danh sách sản phẩm...
        </div>
      )}

      {/* Trạng thái lỗi */}
      {!loading && error && (
        <div className="status-box error-box" data-testid="error-message">
          <p className="error-text">{error}</p>
          <button
            type="button"
            className="btn btn-retry"
            data-testid="retry-button"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Trạng thái rỗng */}
      {!loading && !error && products.length === 0 && (
        <div className="status-box empty-box" data-testid="empty-state">
          Không có sản phẩm nào
        </div>
      )}

      {/* Bảng sản phẩm */}
      {!loading && !error && products.length > 0 && (
        <>
          <ProductTable
            products={products}
            categories={categories}
            onEdit={(p) => navigate(`/products/${p.id}/edit`)}
            onDelete={(p) => setDeletingProduct(p)}
          />

          {/* Vùng phân trang (Mục 4.3.2) */}
          <div className="pagination-container" data-testid="pagination">
            <button
              type="button"
              className="btn btn-secondary btn-pagination"
              data-testid="page-prev"
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
            >
              Trước
            </button>

            <span className="page-current" data-testid="page-current">
              {pageParam} / {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-pagination"
              data-testid="page-next"
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
            >
              Sau
            </button>
          </div>
        </>
      )}

      {/* Modal xác nhận xoá */}
      <ConfirmDialog
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
        loading={deleting}
      />
    </div>
  );
}
