# Phạm Ngũ Lão × Vành đai Tây — Flyover Concept 3D

**Independent, unofficial visualization** of a **hypothetical** flyover at Phạm Ngũ Lão – Western Bypass / đường 10/3 intersection, Buôn Ma Thuột, Đắk Lắk, Việt Nam.

> **Cảnh báo:** Không có nguồn đáng tin cậy được tìm thấy xác nhận dự án cầu vượt đã được phê duyệt hay sẽ khởi công tại chính nút giao này tính đến ngày khảo sát 08/10/2026. Đây không phải thông báo của cơ quan nhà nước, bản vẽ thi công hoặc hồ sơ thiết kế được thẩm định. Cầu, làn xe, độ cao và kích thước đều do người dựng giả định.

## Tính năng

- Mô hình cầu vượt WebGL / Three.js tương tác, camera góc nhìn phối cảnh, từ trên, từ đường.
- Bật/tắt cầu để so sánh mô hình hiện trạng giản lược và phương án ý tưởng.
- Tùy chỉnh cao độ 5.5–11 m, chiều dài 110–220 m, 2 hoặc 4 làn; mô phỏng xe và ngày/đêm.
- Chụp ảnh PNG từ canvas.
- Bản đồ 2D Leaflet: OpenStreetMap, Esri satellite, OpenTopoMap, tâm nút giao tham chiếu.
- Gallery hình AI concept. Ảnh chỉ phục vụ minh họa.
- Hoàn toàn tĩnh; triển khai GitHub Pages từ thư mục gốc nhánh **main** (không dùng GitHub Actions workflow của repo).

## Vị trí & hành chính

- Tham chiếu WGS84: `12.70036°N, 108.02698°E`.
- Vị trí **ước tính từ điểm nối hai đoạn đường** Phạm Ngũ Lão của OpenStreetMap (ways 1185863663 và 1186726656), không phải đo GPS thực địa.
- Báo chí gọi là **vòng xoay Phạm Ngũ Lão / đường tránh Tây / Tỉnh lộ 5**, có đèn tín hiệu; từng có các vụ tai nạn giao thông liên quan xe tải xuống dốc.
- Thuộc **xã Cư Êbur cũ**, sau sắp xếp hành chính được thể hiện ở **phường Buôn Ma Thuột, tỉnh Đắk Lắk**. Chưa tải ranh giới polygon có kiểm chứng nên không vẽ đường địa giới suy đoán.
- Đường phố và cầu 3D là sơ đồ lý tưởng hóa, không phải trực xuất từ ảnh vệ tinh hay mô hình số địa hình.

## Kiểm chứng & nguồn

1. Người Lao Động, 13/05/2021, "Ớn lạnh với cung đường tử thần ở Buôn Ma Thuột": https://tuoitre.vn/nld/thoi-su/on-lanh-voi-cung-duong-tu-than-o-buon-ma-thuot-20210513112118266.htm
2. Báo Đắk Lắk, 2022, "Xử lý những điểm đen": https://baodaklak.vn/phap-luat/202203/kiem-giam-tai-nan-giao-thong-tren-duong-vanh-dai-phia-tay-tp-buon-ma-thuot-xu-ly-nhung-diem-den-ac645ab/
3. Tuổi Trẻ, 24/01/2026: https://tuoitre.vn/video/o-to-tai-tong-2-xe-dung-den-do-lam-chet-3-con-bo-gay-mot-tru-den-moi-dung-lai-193379.htm
4. Quy hoạch chung đến 2025 (chỉ là tài liệu nền, **không** chứng minh có dự án cầu vượt): https://buonmathuot.daklak.gov.vn/thu-tuong-chinh-phu-phe-duyet-quyet-dinh-dieu-chinh-quy-hoach-chung-thanh-pho-buon-ma-thuot-den-2025-1094.html
5. Sắp xếp địa giới phường Buôn Ma Thuột: https://tinhthanhvn.com/bando/dak-lak/buon-ma-thuot
6. Bản đồ OSM: https://www.openstreetmap.org/?mlat=12.70036&mlon=108.02698#map=18/12.70036/108.02698

**Giới hạn:** Tài liệu nguồn không bao gồm phương án thiết kế cầu được phê duyệt, lưu lượng xe và xe nặng, dữ liệu địa chất, bình đồ và trắc dọc thực đo, chỉ giới, năng lực thoát nước, giải pháp chống mất phanh, khái toán chi phí hoặc ĐTM. Không nên suy từ mô phỏng rằng cầu vượt là giải pháp tốt nhất; nghiên cứu an toàn cần đánh giá tốc độ xuống dốc, tổ chức giao thông và nhiều phương án phi công trình.

## Chạy thử

```shell
npx serve . -p 4173
```

Mở `http://localhost:4173/`. Cần Internet cho Three.js, Leaflet và các lớp bản đồ trực tuyến. Chrome/Edge hỗ trợ WebGL2. Không có secrets, API keys, cookies hoặc tài khoản trong source.

## Quyền dữ liệu và ảnh

- OpenStreetMap © contributors, ODbL; Esri World Imagery © Esri and partners; OpenTopoMap © contributors (CC BY-SA).
- Ảnh phối cảnh AI là ý tưởng minh họa do tác giả yêu cầu tạo, **không** phải ảnh chụp dự án và không dựa trên dữ liệu địa hình đo đạc.
- Phần mềm: MIT (xem LICENSE).
