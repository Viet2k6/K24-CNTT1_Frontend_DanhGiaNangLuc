import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductTable from './components/ProductTable.jsx';
import sampleProducts from './data/sample.js';
import './App.css';

function ProductListPage() {
  const displayProducts = [...sampleProducts].reverse();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="add-button"
        >
          Thêm sản phẩm
        </button>
      </div>

      <ProductTable products={displayProducts} />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <header className="site-header">
        <div className="header-container">
          <div className="site-title">OfficeMart Admin</div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}
