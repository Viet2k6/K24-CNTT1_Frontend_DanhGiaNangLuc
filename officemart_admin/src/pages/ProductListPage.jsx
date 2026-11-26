import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ProductListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal xác nhận xoá
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Thông báo toast
  const [toast, setToast] = useState(location.state?.toast || null);

  // Tự ẩn toast sau 3 giây và xoá state trong history
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Tải danh mục
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

  // Hàm tải danh sách sản phẩm
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', {
        params: { page: 1, limit: 10 },
      });
      setProducts(res.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Xử lý xoá sản phẩm
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
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
      {/* Toast thông báo thành công */}
      {toast && (
        <div className="toast" data-testid="toast">
          {toast}
        </div>
      )}

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
            onClick={loadProducts}
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

      {/* Danh sách sản phẩm */}
      {!loading && !error && products.length > 0 && (
        <ProductTable
          products={products}
          categories={categories}
          onEdit={(p) => navigate(`/products/${p.id}/edit`)}
          onDelete={(p) => setDeletingProduct(p)}
        />
      )}

      {/* Hộp thoại xác nhận xoá */}
      <ConfirmDialog
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
        loading={deleting}
      />
    </div>
  );
}
