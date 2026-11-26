import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';

export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tạo AbortController để có thể huỷ request cũ khi params thay đổi
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      // Chuẩn hoá tham số: loại bỏ khoảng trắng thừa ở từ khoá q
      const cleanParams = { ...params };
      if (typeof cleanParams.q === 'string') {
        const trimmed = cleanParams.q.trim();
        if (trimmed) {
          cleanParams.q = trimmed;
        } else {
          delete cleanParams.q;
        }
      }

      // Xoá các tham số rỗng
      Object.keys(cleanParams).forEach((key) => {
        if (cleanParams[key] === '' || cleanParams[key] === undefined || cleanParams[key] === null) {
          delete cleanParams[key];
        }
      });

      try {
        const res = await api.get('/products', {
          params: cleanParams,
          signal: controller.signal,
        });

        // Chỉ cập nhật state nếu request này chưa bị huỷ
        setData(res.data?.data || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        // Nếu lỗi do chính mình huỷ request thì bỏ qua
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
          return;
        }
        setError(err.response?.data?.message || err.message || 'Lỗi tải dữ liệu');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    // Cleanup: Huỷ request cũ ngay khi params thay đổi hoặc component unmount
    return () => {
      controller.abort();
    };
  }, [params.q, params.category, params.status, params.page, params.limit]);

  return { data, total, loading, error, setData, setTotal };
}
