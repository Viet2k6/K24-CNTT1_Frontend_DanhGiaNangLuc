import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import './App.css';

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
          <Route path="/products/new" element={<ProductFormPage mode="create" />} />
          <Route path="/products/:id/edit" element={<ProductFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}
