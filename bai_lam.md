# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** Trần Đăng Việt
- **Lớp:** CNTT1
- **Link repository:** https://github.com/Viet2k6/K24-CNTT1_Frontend_DanhGiaNangLuc
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):** 3ba59df
- **Phiên bản Node.js (gõ `node -v`):** v22.18.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Khởi động API ở chế độ mạng chậm: npm run api:cham (các từ khoá bắt đầu bằng "ban" bị trễ 2,5 giây, các request khác chỉ trễ 0,1 giây).
2. Mở trình duyệt và truy cập trang /products.
3. Nhập từ khoá "ban" vào ô tìm kiếm (request tìm "ban" bắt đầu gửi đi và mất 2,5 giây).
4. Ngay lập tức trong vòng dưới 1 giây, xoá từ khoá "ban" và nhập từ khoá "chuot" (request tìm "chuot" gửi đi và phản hồi sau 0,1 giây).
```

Kết quả hiển thị:

```text
Danh sách sản phẩm ban đầu hiển thị đúng kết quả tìm kiếm của "chuot", nhưng sau 2,5 giây, kết quả của request "ban" phản hồi về và ghi đè lên màn hình. Lúc này ô tìm kiếm đang là "chuot" nhưng dữ liệu bảng lại hiển thị các sản phẩm của "ban" (ví dụ: Bàn phím...).
```

Kết quả đúng:

```text
Danh sách sản phẩm phải luôn hiển thị kết quả của từ khoá tìm kiếm mới nhất ("chuot"). Khi người dùng đổi từ khoá, request cũ đang chờ ("ban") phải bị huỷ bỏ bằng AbortController và không được phép ghi đè lên kết quả hiển thị hiện tại.
```

#### b) Vì sao hook hiển thị sai

Hook `useProductSearch_ai.js` gặp lỗi bất đồng bộ **Race Condition (Tranh chấp tài nguyên mạng)**. Khi tham số `params` thay đổi liên tục, mỗi lần thay đổi kích hoạt một request `api.get()` mới. Do thời gian phản hồi của mạng không đồng đều (request trước bị trễ 2,5s trong khi request sau chỉ mất 0,1s), request cũ phản hồi muộn hơn sẽ gọi `setData()` đè lên dữ liệu của request mới nhất. Đồng thời, hook này thiếu cơ chế huỷ request cũ bằng `AbortController` trong hàm cleanup của `useEffect`.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | "Sửa hook useProductSearch để huỷ request cũ khi params thay đổi bằng AbortController và axios" | `src/hooks/useProductSearch.js`: Khởi tạo `new AbortController()`, truyền `signal` vào `api.get()`, và `controller.abort()` trong hàm cleanup return của `useEffect`. Bắt lỗi huỷ qua `axios.isCancel(err)`. | Sửa | Đoạn mã AI ban đầu không kiểm tra `if (!controller.signal.aborted)` trước khi `setLoading(false)` và chưa xử lý chuẩn các mã lỗi huỷ của axios (`ERR_CANCELED`), làm bung lỗi huỷ ra state `error`. Em đã sửa lại điều kiện bắt lỗi huỷ để bỏ qua và chỉ tắt loading khi request không bị abort. | Chạy thử với `npm run api:cham`: gõ liên tục "ban" rồi đổi sang "chuot", kiểm tra tab Network thấy request "ban" bị `(canceled)`, màn hình hiển thị chuẩn sản phẩm của "chuot", không xuất hiện lỗi đỏ. |
| 2 | "Cách đồng bộ bộ lọc và trang hiện tại lên URL bằng useSearchParams trong React Router 6" | `src/pages/ProductListPage.jsx`: Đọc `q`, `category`, `status`, `page` từ `searchParams`, và dùng `setSearchParams` khi người dùng thay đổi bộ lọc hoặc phân trang. | Giữ | Ý tưởng và cú pháp AI đưa ra đúng chuẩn React Router 6 theo Phụ lục 3.C, code trực quan và xử lý tốt tính năng Back/Forward của trình duyệt. | Copy link URL `/products?category=mouse&page=2` mở trong tab ẩn danh mới: trang load đúng danh mục Chuột và trang 2. Nhấn nút Back/Forward trên trình duyệt, các dropdown và bảng tự động cập nhật đồng bộ. |

## Ghi chú (không tính điểm)

Các trường hợp biên đã được xử lý:
1. **Từ khoá tìm kiếm chỉ có khoảng trắng:**
   - Trong `ProductListPage.jsx` và hook `useProductSearch.js`, từ khoá được `trim()` trước khi đẩy lên URL và gọi API. Nếu người dùng chỉ gõ các dấu cách ("   "), từ khoá được coi như rỗng, tham số `q` được loại bỏ khỏi request để tải lại toàn bộ danh sách, tránh gửi request rác lên server.
2. **Số trang trên URL không hợp lệ (ví dụ: `page=-3`, `page=0`, `page=abc`):**
   - Đọc và ép kiểu qua `parseInt(page, 10)`: nếu là `NaN` hoặc `< 1`, mặc định đưa về `page = 1`.
3. **Số trang vượt quá tổng số trang (ví dụ: `page=999`):**
   - Khi API tải về `total`, tính `totalPages = Math.max(1, Math.ceil(total / 10))`.
   - Nếu `pageParam > totalPages` (khi `total > 0`), hệ thống tự động điều hướng về `page = totalPages` để không hiển thị trang trắng rỗng.
