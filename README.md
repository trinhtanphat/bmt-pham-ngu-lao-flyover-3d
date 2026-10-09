# NGÃ 5 PHẠM NGŨ LÃO × ĐƯỜNG 10 THÁNG 3 – BRIDGE CONCEPT 3D

**Live demo:** https://trinhtanphat.github.io/bmt-pham-ngu-lao-flyover-3d/

Research-backed, unofficial 3D concept for the Phạm Ngũ Lão / Đường 10 Tháng 3 / Vành đai phía Tây traffic circle, Buôn Ma Thuột, Đắk Lắk, Việt Nam.

> **Không phải dự án chính thức.** Chưa có thông tin đủ tin cậy trong các nguồn đối chiếu xác nhận xây cầu vượt tại nút giao này. Bất kỳ hình ảnh, cao độ, tuyến và cấu tạo cầu 3D đều là phương án minh họa. Không sử dụng để thiết kế, giải phóng mặt bằng hoặc thi công.

## Quan trọng: địa hình ngã 5 thực, không phải ngã tư

Ngày 09/10/2026, bản đầu (hai đường thẳng vuông góc có đường xuyên đảo) đã bị thay thế sau phản hồi của người sử dụng vì sai cấu trúc.

Bản mới dựa vào **hình học OpenStreetMap gốc** (tải 09/10/2026):

- Vòng xoay OSM way **1251057553** gồm **23 nút độc lập** khép kín; một vùng đảo ở trung tâm không cho xe chạy xuyên.
- Phạm Ngũ Lão phía nam (way **1185863663**).
- Phạm Ngũ Lão phía tây bắc (way **1186726656**).
- Nhánh đường dân cư phía bắc (way **538950821**) tách chữ **Y** từ Phạm Ngũ Lão ở khoảng 25m về phía bắc vòng xoay. **Nhánh thứ năm không nối trực tiếp vào vòng xoay.**
- Đường 10 Tháng 3 / Vành đai Tây phía tây có hai tim đường một chiều riêng (ways **318391584**, **1251057552**).
- Đường 10 Tháng 3 / Vành đai Tây phía đông có hai tim đường một chiều riêng (ways **318391582**, **1251057550**).
- Năm hướng tiếp cận gồm: nam, tây bắc, nhánh Y bắc, đường 10/3 tây và đường 10/3 đông. Đường 10/3 có hai chiều tách đôi tạo 7 tim đường trong tập dữ liệu.
- Dữ liệu tọa độ sử dụng WGS84, gốc hiển thị tạm tại **12.70036°N 108.02698°E**; mô hình 3D xấp xỉ bằng local East/North meters. Đây không phải hồ sơ khảo sát địa chính/địa hình.

Bản đồ vệ tinh hiển thị từ Esri trực tuyến. Nút giao 3D thể hiện đường nền theo các tim OSM; **bề rộng đường, đảo cây xanh, công trình xung quanh, độ cao mặt cầu, hướng dốc cầu và tổ chức làn trong bản dựng là giả định**. Không nên diễn giải 3D là bản vẽ hoàn công hoặc công bố quyết định đầu tư.

## Chức năng

- 3D WebGL Three.js 0.169: xoay, zoom, 3 chế độ camera (3D, từ trên, mặt đường).
- 23 điểm vòng xoay và 7 đường tim OSM, nhánh chữ Y bắc.
- Xe theo 12 quỹ đạo vào - vòng - ra ở mặt đất, **không chạy xuyên đảo**. Xe cầu vượt chạy ở cao độ khác; trụ đặt tại khoảng trống giữa các tim làn đường trên mô hình giản lược.
- Cấu hình mặt cầu (2/4 làn), chiều dài phần trên cao, cao độ (5.5-11m), ngày/đêm, bật/tắt lưu thông và cầu.
- Xuất hình PNG 3D từ canvas.
- Leaflet 2D: OSM, Esri satellite và OpenTopoMap, lớp phủ tuyến đường OSM, đi kèm ghi chú về nhánh thứ năm.
- Ảnh: một ảnh xuất trực tiếp từ WebGL có hình học 5 nhánh; hai ảnh AI đề xuất thẩm mỹ, được đánh dấu là hình minh họa không phải phương án phê duyệt.

## Chạy & kiểm tra

Trang web tĩnh, không backend, không cookies và không tài khoản. Không bắt buộc build npm. Dùng máy chủ HTTP (ESModules từ file:// không hỗ trợ):

```bash
python -m http.server 4187
# mở http://localhost:4187/
node tests/geometry-check.mjs
```

Bài test xác nhận:

- 5 nhánh giao thông, 7 way gốc và 23 đỉnh vòng xoay.
- Nhánh Y nối vào Phạm Ngũ Lão trước vòng xoay, không xuyên đảo.
- 12 quỹ đạo xe có bán kính nhỏ nhất >10,8m cách tâm trên mô hình, không đâm qua vùng đảo.
- Chân trụ cầu thử nghiệm không nằm trên mặt đường tĩnh trong tập dữ liệu xấp xỉ, và không đặt vào vòng xoay.

**Không có mô phỏng tín hiệu, xung đột xe tự động, mật độ xe thực, bán kính bó vỉa khảo sát, kiểm toán ATGT, địa chất, tĩnh tải hay lưu lượng cao điểm**. Không tuyên bố dự án khả thi hoặc đạt tiêu chuẩn thiết kế cầu.

## Nguồn

- OSM & contributor licenses: https://www.openstreetmap.org/copyright
- Vị trí: https://www.openstreetmap.org/?mlat=12.70036&mlon=108.02698#map=19/12.70036/108.02698
- Bài báo về nút giao: https://baodaklak.vn/phap-luat/202203/kiem-giam-tai-nan-giao-thong-tren-duong-vanh-dai-phia-tay-tp-buon-ma-thuot-xu-ly-nhung-diem-den-ac645ab/
- Thông tin tai nạn 24/01/2026: https://tuoitre.vn/video/o-to-tai-tong-2-xe-dung-den-do-lam-chet-3-con-bo-gay-mot-tru-den-moi-dung-lai-193379.htm
- Cổng thông tin tỉnh: https://daklak.gov.vn
- Các library nguồn: xem THIRD_PARTY_NOTICES.md.

License mã ứng dụng: MIT. Copyright © OpenStreetMap contributors and various imagery providers remains with respective owners. Không chụp và phát hành lại tile Google Maps / Google Earth.
