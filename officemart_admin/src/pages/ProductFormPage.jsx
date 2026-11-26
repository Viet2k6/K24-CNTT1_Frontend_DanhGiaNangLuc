import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function ProductFormPage({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: 0,
    status: 'active',
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  // Tải danh sách danh mục
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Không tải được danh mục:', err);
      }
    }
    loadCategories();
  }, []);

  // Tải dữ liệu sản phẩm nếu ở chế độ sửa
  useEffect(() => {
    if (!isEdit || !id) return;

    async function loadProduct() {
      setLoadingProduct(true);
      setNotFound(false);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data) {
          setForm({
            name: res.data.name || '',
            sku: res.data.sku || '',
            category: res.data.category || '',
            price: res.data.price ?? '',
            stock: res.data.stock ?? 0,
            status: res.data.status || 'active',
          });
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          alert(err.response?.data?.message || 'Lỗi khi tải thông tin sản phẩm');
        }
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xoá lỗi của trường đó khi người dùng bắt đầu chỉnh sửa lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Kiểm tra tính hợp lệ của dữ liệu (Client-side validation)
  const validateForm = () => {
    const newErrors = {};

    // name: bắt buộc, 3 đến 100 ký tự sau khi trim
    const trimmedName = (form.name || '').trim();
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 100) {
      newErrors.name = 'Tên sản phẩm bắt buộc, từ 3 đến 100 ký tự';
    }

    // sku: bắt buộc, đúng định dạng ABC-1234
    const skuRegex = /^[A-Z]{3}-\d{4}$/;
    if (!form.sku || !skuRegex.test(form.sku)) {
      newErrors.sku = 'SKU bắt buộc, đúng định dạng ABC-1234 (3 chữ hoa - 4 chữ số)';
    }

    // category: bắt buộc chọn
    if (!form.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    // price: số lớn hơn 0
    const priceNum = Number(form.price);
    if (form.price === '' || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Giá phải là số lớn hơn 0';
    }

    // stock: số nguyên, không âm
    const stockNum = Number(form.stock);
    if (form.stock === '' || isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      newErrors.stock = 'Tồn kho phải là số nguyên không âm (≥ 0)';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    const payload = {
      name: form.name.trim(),
      sku: form.sku,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        navigate('/products', { state: { toast: 'Đã cập nhật sản phẩm' } });
      } else {
        await api.post('/products', payload);
        navigate('/products', { state: { toast: 'Đã thêm sản phẩm' } });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Lỗi 409 trùng SKU: giữ nguyên dữ liệu đã nhập, chỉ báo lỗi ở field-error-sku
        setErrors((prev) => ({
          ...prev,
          sku: err.response.data?.message || 'SKU đã tồn tại',
        }));
      } else {
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="page-container">
        <div className="status-box loading-box">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container">
        <div className="status-box error-box">
          <p>Không tìm thấy sản phẩm</p>
          <Link to="/products" className="btn btn-secondary">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-card">
        <h2>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>

        <form data-testid="product-form" onSubmit={handleSubmit}>
          {/* Tên sản phẩm */}
          <div className="form-group">
            <label htmlFor="name">
              Tên sản phẩm <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm (3 - 100 ký tự)"
            />
            {errors.name && (
              <div className="field-error" data-testid="field-error-name">
                {errors.name}
              </div>
            )}
          </div>

          {/* SKU */}
          <div className="form-group">
            <label htmlFor="sku">
              SKU <span className="required">*</span>
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              className={`form-input ${errors.sku ? 'input-error' : ''}`}
              value={form.sku}
              onChange={handleChange}
              placeholder="Ví dụ: KEY-0001, MOU-1234"
            />
            {errors.sku && (
              <div className="field-error" data-testid="field-error-sku">
                {errors.sku}
              </div>
            )}
          </div>

          {/* Danh mục */}
          <div className="form-group">
            <label htmlFor="category">
              Danh mục <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className={`form-input ${errors.category ? 'input-error' : ''}`}
              value={form.category}
              onChange={handleChange}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <div className="field-error" data-testid="field-error-category">
                {errors.category}
              </div>
            )}
          </div>

          {/* Giá */}
          <div className="form-group">
            <label htmlFor="price">
              Giá (VNĐ) <span className="required">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              className={`form-input ${errors.price ? 'input-error' : ''}`}
              value={form.price}
              onChange={handleChange}
              placeholder="Nhập giá lớn hơn 0"
            />
            {errors.price && (
              <div className="field-error" data-testid="field-error-price">
                {errors.price}
              </div>
            )}
          </div>

          {/* Tồn kho */}
          <div className="form-group">
            <label htmlFor="stock">
              Tồn kho <span className="required">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              className={`form-input ${errors.stock ? 'input-error' : ''}`}
              value={form.stock}
              onChange={handleChange}
              placeholder="Nhập số nguyên không âm (≥ 0)"
            />
            {errors.stock && (
              <div className="field-error" data-testid="field-error-stock">
                {errors.stock}
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>

          {/* Nút thao tác */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="submit-button"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/products')}
              disabled={saving}
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
