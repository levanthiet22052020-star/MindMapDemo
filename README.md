# MindMapDemo

Ứng dụng React Native (Expo) minh họa màn hình **Mind Map** cho bài học **Lịch sử 10 - Kháng chiến chống thực dân Pháp (1946-1954)**.

Giao diện hiện đại với organic bezier curves, gradient node gốc, 6 tone màu pastel cho từng nhánh, decorative background blobs, soft shadows và fully responsive trên desktop lẫn mobile.

---

## Cài đặt

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [Git](https://git-scm.com/)
- **Điện thoại**: cài [Expo Go](https://expo.dev/go) (iOS / Android)
- **Hoặc**: chạy trên web với trình duyệt bất kỳ

### Các bước cài đặt

```bash
# 1. Clone project
git clone https://github.com/levanthiet22052020-star/MindMapDemo.git
cd MindMapDemo

# 2. Cài dependencies
npm install

# 3. Chạy project
npx expo start
```

### Chạy trên các nền tảng

| Nền tảng | Cách chạy |
|----------|-----------|
| **Điện thoại** | Mở app **Expo Go** → quét mã QR trên terminal |
| **Web** | Nhấn phím `w` trong terminal hoặc truy cập URL hiển thị |
| **Android Emulator** | Nhấn phím `a` (cần cài Android Studio) |
| **iOS Simulator** | Nhấn phím `i` (chỉ trên macOS, cần Xcode) |

---

## Cấu trúc thư mục

```
MindMapDemo/
├── App.tsx                              # Entry point
├── index.js                             # Register root component
├── package.json                         # Dependencies
├── app.json                             # Expo config
├── babel.config.js                      # Babel + Reanimated plugin
├── tsconfig.json                        # TypeScript config
└── src/
    ├── types/
    │   └── mindmap.ts                   # Kiểu dữ liệu MindMapNode, MindMapData
    ├── constants/
    │   └── theme.ts                     # Màu sắc, kích thước node, BranchColors
    ├── utils/
    │   └── layout.ts                    # Layout algorithm + normalize + dữ liệu bài học
    ├── components/
    │   └── MindMap/
    │       └── index.tsx                # Component chính (SVG + Pan/Zoom + Auto-fit)
    └── screens/
        └── MindMapScreen.tsx            # Màn hình (Header + Map + Toolbar)
```

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| **Mind Map tương tác** | Sơ đồ phân nhánh organic với node gốc gradient tím, 5 nhánh pastel |
| **Thêm node con** | Nhấn nút **"+"** viền tím bên phải mỗi node |
| **Thu gọn / Mở rộng** | Nhấn nút **▴ / ▾** trên node có nhánh con |
| **Kéo (Pan)** | Vuốt một ngón để di chuyển sơ đồ |
| **Phóng to / Thu nhỏ (Zoom)** | Pinch hai ngón hoặc cuộn chuột (trên web) |
| **Auto-fit** | Tự động scale vừa màn hình, tự re-fit khi expand/collapse/thêm node |
| **Fit View button** | Nút scan trên toolbar → reset pan/zoom về auto-fit |
| **Responsive** | Hiển thị tốt trên desktop, mobile, web |
| **Coordinate normalization** | Tọa độ chuẩn hóa dương → không bị cắt ở mép |
| **Organic layout** | Nhánh lệch nhẹ lên/xuống tạo cảm giác tự nhiên |

---

## Giao diện

### Header

- Thanh màu tím gradient
- Avatar + pills (huy hiệu, coin, streak fire)
- Breadcrumb: "LỊCH SỬ 10 > CHƯƠNG I"
- Tiêu đề bài học + subtitle "Mind map"

### Mind Map

- Node gốc: gradient tím, bo góc pill, shadow tím soft
- Node nhánh chính: nền pastel, viền theo tone nhánh, left accent bar
- Node con: nền trắng, viền nhạt, bo góc mềm
- Đường nối: organic bezier curve, màu theo tone nhánh, opacity nhẹ
- Background: decorative blobs pastel tạo chiều sâu
- Toolbar góc trên phải: nút fit view + menu

### Bảng màu 6 nhánh

| Nhánh | Nền | Viền | Accent | Tone |
|-------|-----|------|--------|------|
| 1 | `#F0EDFF` | `#D5CCFF` | `#7C5CFC` | Tím nhạt |
| 2 | `#EDF7FF` | `#C8E2FF` | `#0984E3` | Xanh dương nhạt |
| 3 | `#FFF5EC` | `#FFE0C2` | `#E17055` | Cam nhạt |
| 4 | `#EDFFF4` | `#C8F5D8` | `#00B894` | Xanh lá nhạt |
| 5 | `#FFF8E1` | `#FFECB3` | `#FDCB6E` | Vàng nhạt |
| 6 | `#FFF0F5` | `#FFC8D9` | `#FD79A8` | Hồng nhạt |

---

## Dữ liệu mẫu

Bài: **Kháng chiến chống thực dân Pháp (1946 - 1954)** - Lịch sử 10

```
Kháng chiến chống Pháp (1946-1954)
├── Bối cảnh lịch sử (tím nhạt)
│   ├── Pháp quay lại xâm lược VN
│   ├── Hiệp định Sơ bộ 6/3/1946
│   └── Tạm ước 14/9/1946
├── Đường lối kháng chiến (xanh dương nhạt)
│   ├── Toàn dân
│   ├── Toàn diện
│   ├── Trường kỳ
│   └── Tự lực cánh sinh
├── Diễn biến chính (cam nhạt)
│   ├── Toàn quốc kháng chiến 12/1946
│   ├── Việt Bắc Thu - Đông 1947
│   ├── Biên Giới Thu - Đông 1950
│   └── Điện Biên Phủ 1954
├── Kết quả (xanh lá nhạt)
│   ├── Chiến thắng ĐBP lịch sử
│   ├── Hiệp định Genève 7/1954
│   └── Giải phóng miền Bắc
└── Ý nghĩa lịch sử (vàng nhạt)
    ├── Củng cố chính quyền
    ├── Tiền đề thống nhất
    └── Cổ vũ GPDT thế giới
```

---

## Kiến trúc

### Tree data structure

```ts
interface MindMapNode {
  id: string;              // ID duy nhất
  text: string;            // Nội dung hiển thị
  subtitle?: string;       // Phụ đề (tuỳ chọn)
  color: string;           // Màu nền
  textColor?: string;      // Màu chữ
  children: string[];      // ID các node con
  parentId: string | null; // null nếu là root
  collapsed?: boolean;     // Đang thu gọn?
}
```

### Layout algorithm

- Root nằm bên trái, nhánh mở sang phải
- Mỗi level cách `horizontalGap` (48px)
- Node cùng cấp xếp dọc, cách `verticalGap` (14px)
- Organic offset: nhánh con lệch nhẹ lên/xuần tạo cảm giác tự nhiên
- Chiều cao subtree tính đệ quy → node cha luôn nằm giữa các con

### Coordinate normalization

1. Layout tính raw positions
2. `normalizeLayout()` dịch toàn bộ tọa độ về vùng dương (bắt đầu từ 48, 48)
3. Bounds bao gồm nút "+", collapse button, shadow, bezier curves
4. Auto-fit tính scale & offset dựa trên normalized content size
5. Không có tọa độ âm → SVG không cắt nội dung

### Rendering pipeline

- **SVG** vẽ node (gradient, shadow, accent bar), đường nối bezier organic, decorative blobs
- **react-native-gesture-handler** xử lý pan & pinch (simultaneous)
- **react-native-reanimated** animate transform mượt với `withTiming`
- Auto-fit tính scale & offset dựa trên kích thước container thực tế (`onLayout`)
- Nút "+" viền tím nền nhạt, collapse button nền tím nhạt

---

## Tùy chỉnh

### Đổi bài học khác

Sửa hàm `createInitialData()` trong `src/utils/layout.ts`:

```ts
[rootId]: {
  id: rootId,
  text: 'Tên bài học mới',
  color: '#7C5CFC',       // Gradient tím (root)
  textColor: '#FFFFFF',
  children: [branch1, branch2],
  parentId: null,
  collapsed: false,
},
```

Màu nhánh tự map qua `BranchColors` trong `theme.ts`.

### Đổi kích thước node

Sửa `NodeConfig` trong `src/constants/theme.ts`:

```ts
export const NodeConfig = {
  rootWidth: 164,       // Rộng node gốc
  rootHeight: 48,       // Cao node gốc
  rootRadius: 24,       // Bo góc node gốc
  nodeWidth: 132,       // Rộng node nhánh
  nodeHeight: 42,       // Cao node nhánh
  nodeRadius: 14,       // Bo góc node nhánh
  subNodeWidth: 122,    // Rộng node lá
  subNodeHeight: 36,    // Cao node lá
  subNodeRadius: 12,    // Bo góc node lá
  horizontalGap: 48,    // Khoảng cách ngang
  verticalGap: 14,      // Khoảng cách dọc
};
```

---

## Tech stack

| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| Expo SDK | ~52 | Framework chính |
| React Native | ~0.76 | UI framework |
| react-native-svg | ~15.8 | Vẽ SVG (node, bezier, gradient, shadow, blobs) |
| react-native-gesture-handler | ~2.20 | Pan & pinch gesture |
| react-native-reanimated | ~3.16 | Animation zoom/pan mượt |
| TypeScript | ~5.3 | Type safety |

---

## License

MIT
