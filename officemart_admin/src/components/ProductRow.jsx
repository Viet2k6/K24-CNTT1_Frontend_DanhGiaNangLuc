import React from 'react';
import { categoryNames } from '../data/sample.js';

export default function ProductRow({ product, onEdit, onDelete, categories = [] }) {
  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price) + ' ₫';
  const isOutOfStock = product.stock === 0;
  const isActive = product.status === 'active';

  const categoryDisplayName =
    categories.find?.((c) => c.id === product.category)?.name ||
    categoryNames[product.category] ||
    product.category;

  return (
    <tr className="product-row" data-testid="product-row">
      <td className="col-name">
        <span className="mobile-label">Tên</span>
        <span className="cell-value">{product.name}</span>
      </td>
      <td className="col-sku">
        <span className="mobile-label">SKU</span>
        <span className="cell-value">{product.sku}</span>
      </td>
      <td className="col-category">
        <span className="mobile-label">Danh mục</span>
        <span className="cell-value">{categoryDisplayName}</span>
      </td>
      <td className="col-price">
        <span className="mobile-label">Giá</span>
        <span className="cell-value">{formattedPrice}</span>
      </td>
      <td className="col-stock">
        <span className="mobile-label">Tồn kho</span>
        <span className={`cell-value ${isOutOfStock ? 'stock-zero' : ''}`}>
          {isOutOfStock ? 'Hết hàng' : product.stock}
        </span>
      </td>
      <td className="col-status">
        <span className="mobile-label">Trạng thái</span>
        <span
          data-testid="product-status"
          className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
        >
          {isActive ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td className="col-actions">
        <span className="mobile-label">Thao tác</span>
        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-edit"
            data-testid="edit-button"
            onClick={() => onEdit?.(product)}
          >
            Sửa
          </button>
          <button
            type="button"
            className="btn btn-delete"
            data-testid="delete-button"
            onClick={() => onDelete?.(product)}
          >
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}
