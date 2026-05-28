# MindMapDemo

Ứng dụng React Native (Expo) minh họa màn hình **Mind Map** cho bài học Lịch sử 10 - Kháng chiến chống thực dân Pháp (1946-1954).

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
    │   └── theme.ts                     # Màu sắc, kích thước node
    ├── utils/
    │   └── layout.ts                    # Layout algorithm + dữ liệu bài học
    ├── components/
    │   └── MindMap/
    │       └── index.tsx                # Component chính (SVG + Pan/Zoom)
    └── screens/
        └── MindMapScreen.tsx            # Màn hình (Header + Map + Toolbar)
```

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| Mind Map tương tác | Sơ đồ phân nhánh với node gốc xanh dương, 5 nhánh chính |
| Thêm node con | Nhấn nút **"+"** xanh ở góc trên phải mỗi node |
| Thu gọn / Mở rộng | Nhấn nút **▴ / ▾** trên node có nhánh con |
| Kéo (Pan) | Vuốt một ngón để di chuyển sơ đồ |
| Phóng to / Thu nhỏ (Zoom) | Pinch hai ngón hoặc cuộn chuột (trên web) |
| Auto-fit | Tự động scale vừa màn hình khi mở / thu gọn nhánh |
| Responsive | Hiển thị tốt trên cả desktop lẫn mobile |

---

## Dữ liệu mẫu

Bài: **Kháng chiến chống thực dân Pháp (1946 - 1954)** - Lịch sử 10

```
Kháng chiến chống Pháp (1946-1954)
├── Bối cảnh lịch sử
│   ├── Pháp quay lại xâm lược VN sau CTTG2
│   ├── Hiệp định Sơ bộ 6/3/1946
│   └── Tạm ước 14/9/1946
├── Đường lối kháng chiến
│   ├── Toàn dân
│   ├── Toàn diện
│   ├── Trường kỳ
│   └── Tự lực cánh sinh
├── Diễn biến chính
│   ├── Toàn quốc kháng chiến 19/12/1946
│   ├── Chiến dịch Việt Bắc 1947
│   ├── Chiến dịch Biên Giới 1950
│   └── Chiến dịch Điện Biên Phủ 1954
├── Kết quả
│   ├── Chiến thắng Điện Biên Phủ lịch sử
│   ├── Hiệp định Genève 7/1954
│   └── Giải phóng hoàn toàn miền Bắc
└── Ý nghĩa lịch sử
    ├── Củng cố chính quyền dân chủ nhân dân
    ├── Tạo tiền đề thống nhất đất nước
    └── Cổ vũ phong trào GPDT thế giới
```

---

## Kiến trúc

### Tree data structure

```ts
interface MindMapNode {
  id: string;              // ID duy nhất
  text: string;            // Nội dung hiển thị
  color: string;           // Màu nền
  textColor?: string;      // Màu chữ
  children: string[];      // ID các node con
  parentId: string | null; // null nếu là root
  collapsed?: boolean;     // Đang thu gọn?
}
```

### Layout algorithm

- Root nằm bên trái, nhánh mở sang phải
- Mỗi level cách `horizontalGap` (45px)
- Node cùng cấp xếp dọc, cách `verticalGap` (10px)
- Chiều cao subtree tính đệ quy → node cha luôn nằm giữa các con

### Rendering

- **SVG** vẽ node, đường nối bezier, shadow
- **react-native-gesture-handler** xử lý pan & pinch
- **react-native-reanimated** animate transform mượt
- Auto-fit tính scale & offset dựa trên kích thước container thực tế

---

## Tùy chỉnh

### Đổi bài học khác

Sửa hàm `createInitialData()` trong `src/utils/layout.ts`:

```ts
[rootId]: {
  id: rootId,
  text: 'Tên bài học mới',
  color: '#4A7BF7',
  textColor: '#FFFFFF',
  children: [branch1, branch2],
  parentId: null,
  collapsed: false,
},
```

### Bảng màu

| Màu hex | Dùng cho |
|---------|----------|
| `#4A7BF7` | Node gốc (xanh dương) |
| `#FFF7ED` | Nhánh - cam nhạt |
| `#F0FDF4` | Nhánh - xanh lá nhạt |
| `#FDF2F8` | Nhánh - hồng nhạt |
| `#FEF9C3` | Nhánh - vàng nhạt |
| `#F5F3FF` | Nhánh - tím nhạt |
| `#FFFFFF` | Node lá |

### Đổi kích thước node

Sửa `NodeConfig` trong `src/constants/theme.ts`:

```ts
export const NodeConfig = {
  rootWidth: 180,       // Rộng node gốc
  rootHeight: 48,       // Cao node gốc
  nodeWidth: 130,       // Rộng node nhánh
  nodeHeight: 40,       // Cao node nhánh
  subNodeWidth: 120,    // Rộng node lá
  subNodeHeight: 36,    // Cao node lá
  horizontalGap: 45,    // Khoảng cách ngang
  verticalGap: 10,      // Khoảng cách dọc
};
```

---

## Tech stack

| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| Expo SDK | ~52 | Framework chính |
| React Native | ~0.76 | UI framework |
| react-native-svg | ~15.8 | Vẽ SVG (node, đường nối, shadow) |
| react-native-gesture-handler | ~2.20 | Pan & pinch gesture |
| react-native-reanimated | ~3.16 | Animation zoom/pan |
| TypeScript | ~5.3 | Type safety |

---

## License

MIT
