import React from 'react';

export default function ConfirmDialog({ product, onConfirm, onCancel, loading }) {
  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" data-testid="confirm-dialog">
        <h3 className="modal-title">Xác nhận xoá</h3>
        <p className="modal-message">
          Bạn có chắc chắn muốn xoá sản phẩm <strong>"{product.name}"</strong> (SKU: {product.sku}) không?
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="confirm-no"
            onClick={onCancel}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="btn btn-danger"
            data-testid="confirm-yes"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xoá...' : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  );
}
