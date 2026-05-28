# MindMapDemo

Ứng dụng React Native (Expo) demo màn hình Mind Map cho bài học **Lịch sử 10 - Kháng chiến chống thực dân Pháp (1946-1954)**.

## Cài đặt & Chạy

```bash
cd MindMapDemo
npm install
npx expo start
```

Quét QR bằng **Expo Go** trên điện thoại để chạy.

---

## Cấu trúc thư mục

```
MindMapDemo/
├── App.tsx                          # Entry point
├── index.js                         # Register root component
├── package.json                     # Dependencies
├── app.json                         # Expo config
├── babel.config.js                  # Babel (Reanimated plugin)
├── tsconfig.json                    # TypeScript config
└── src/
    ├── types/
    │   └── mindmap.ts               # Kiểu MindMapNode, MindMapData
    ├── constants/
    │   └── theme.ts                 # Màu sắc, kích thước node
    ├── utils/
    │   └── layout.ts                # Layout algorithm + dữ liệu bài học
    ├── components/MindMap/
    │   └── index.tsx                # Component chính (SVG + Pan/Zoom)
    └── screens/
        └── MindMapScreen.tsx        # Màn hình (Header + Map + Toolbar)
```

---

## Kiến trúc & Cách hoạt động

### 1. Dữ liệu (Tree structure)

Mỗi node là một object `MindMapNode`:

```ts
interface MindMapNode {
  id: string;           // ID duy nhất
  text: string;         // Nội dung hiển thị
  color: string;        // Màu nền node
  textColor?: string;   // Màu chữ (mặc định #1E293B)
  children: string[];   // Danh sách ID node con
  parentId: string | null;  // ID node cha (root = null)
  collapsed?: boolean;  // Đang thu gọn?
}
```

Toàn bộ data là một `MindMapData` chứa `nodes` (record theo id) và `rootId`.

### 2. Layout algorithm

File `src/utils/layout.ts` tính vị trí (x, y) cho từng node:

- **Root** nằm bên trái, các nhánh mở sang phải
- Mỗi nhánh con nằm **bên phải** node cha, cách `horizontalGap` (55px)
- Các node cùng cấp xếp **dọc**, cách nhau `verticalGap` (12px)
- Chiều cao subtree được tính đệ quy → node cha luôn nằm giữa các con

```
Root ──┬── Bối cảnh lịch sử ──┬── Pháp quay lại...
       │                      ├── Hiệp định Sơ bộ 6/3
       │                      └── Tạm ước 14/9
       ├── Đường lối ────────┬── Toàn dân
       │                      ├── Toàn diện
       │                      ├── Trường kỳ
       │                      └── Tự lực cánh sinh
       ├── Diễn biến ────────┬── Toàn quốc kháng chiến
       │                      ├── Việt Bắc 1947
       │                      ├── Biên Giới 1950
       │                      └── Điện Biên Phủ 1954
       ├── Kết quả ──────────┬── Chiến thắng ĐBP
       │                      ├── Hiệp định Genève
       │                      └── Giải phóng miền Bắc
       └── Ý nghĩa ──────────┬── Củng cố chính quyền
                              ├── Tiền đề thống nhất
                              └── Cổ vũ GPDT thế giới
```

### 3. Rendering (SVG)

File `src/components/MindMap/index.tsx` render toàn bộ mind map bằng `react-native-svg`:

| Layer | Cách vẽ |
|-------|---------|
| **Connections** | `Path` với Bezier curve (`M...C...`) - đường cong mượt |
| **Node shadow** | `Rect` + SVG `Filter` (`FeDropShadow`) |
| **Node body** | `Rect` bo góc (`rx/ry`), màu theo level |
| **Node text** | `ForeignObject` + RN `Text` (hỗ trợ multiline) |
| **Nút "+"** | `ForeignObject` + RN `TouchableOpacity` (góc trên phải) |
| **Nút thu gọn** | `ForeignObject` + RN `TouchableOpacity` (▴/▾) |

### 4. Pan & Zoom

Sử dụng **react-native-gesture-handler** + **react-native-reanimated**:

- `Gesture.Pinch()` → zoom (giới hạn 0.3x - 3x)
- `Gesture.Pan()` → kéo di chuyển
- Hai gesture chạy đồng thời qua `Gesture.Simultaneous()`
- Transform áp dụng lên toàn bộ `Animated.View` chứa SVG

---

## Tính năng

| Tính năng | Cách dùng |
|-----------|-----------|
| **Thêm node con** | Nhấn nút **"+"** xanh ở góc trên phải node |
| **Thu gọn nhánh** | Nhấn nút **▴** trên node có con |
| **Mở rộng nhánh** | Nhấn nút **▾** trên node đang thu gọn |
| **Keo sơ đồ** | Vuốt một ngón tay |
| **Phóng to / Thu nhỏ** | Pinch hai ngón |

---

## Cách tùy chỉnh

### Đổi bài học khác

Sửa hàm `createInitialData()` trong `src/utils/layout.ts`:

```ts
export function createInitialData(): MindMapData {
  const rootId = 'root';
  const branch1 = 'b1';
  const branch2 = 'b2';

  const nodes: Record<string, MindMapNode> = {
    [rootId]: {
      id: rootId,
      text: 'Tên bài học',
      x: 0, y: 0,
      color: '#4A7BF7',      // Xanh dương (root)
      textColor: '#FFFFFF',
      children: [branch1, branch2],
      parentId: null,
      collapsed: false,
    },
    [branch1]: {
      id: branch1,
      text: 'Nhánh 1',
      x: 0, y: 0,
      color: '#FFF7ED',       // Cam nhạt (branch)
      children: [],
      parentId: rootId,
      collapsed: false,
    },
    [branch2]: {
      id: branch2,
      text: 'Nhánh 2',
      x: 0, y: 0,
      color: '#F0FDF4',       // Xanh lá nhạt (branch)
      children: [],
      parentId: rootId,
      collapsed: false,
    },
  };

  return { nodes, rootId };
}
```

### Bảng màu theo nhánh

| Màu hex | Dùng cho | Visual |
|---------|----------|--------|
| `#4A7BF7` | Root | Xanh dương đậm |
| `#FFF7ED` | Branch 1 | Cam nhạt |
| `#F0FDF4` | Branch 2 | Xanh lá nhạt |
| `#FDF2F8` | Branch 3 | Hồng nhạt |
| `#FEF9C3` | Branch 4 | Vàng nhạt |
| `#F5F3FF` | Branch 5 | Tím nhạt |
| `#FFFFFF` | Node con | Trắng |
| `#FFF1F2` | Node nổi bật | Đỏ nhạt |

### Đổi kích thước node

Sửa `NodeConfig` trong `src/constants/theme.ts`:

```ts
export const NodeConfig = {
  rootWidth: 200,       // Rộng node gốc
  rootHeight: 52,       // Cao node gốc
  nodeWidth: 150,       // Rộng node nhánh
  nodeHeight: 44,       // Cao node nhánh
  subNodeWidth: 140,    // Rộng node lá
  subNodeHeight: 38,    // Cao node lá
  horizontalGap: 55,    // Khoảng cách ngang giữa các cấp
  verticalGap: 12,      // Khoảng cách dọc giữa các node cùng cấp
};
```

---

## Tech stack

| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| Expo SDK | 52 | Framework chính |
| React Native | 0.76 | UI framework |
| react-native-svg | 15.8 | Vẽ node, đường nối, shadow bằng SVG |
| react-native-gesture-handler | 2.20 | Pan & pinch gesture |
| react-native-reanimated | 3.16 | Animation mượt cho zoom/pan |
| TypeScript | 5.3 | Type safety |

---

## Dữ liệu mẫu hiện tại

Bài: **Kháng chiến chống thực dân Pháp (1946 - 1954)** - Lịch sử 10

```
Root: Kháng chiến chống Pháp (1946-1954)
├── Bối cảnh lịch sử (cam nhạt)
│   ├── Pháp quay lại xâm lược VN sau CTTG2
│   ├── Hiệp định Sơ bộ 6/3/1946
│   └── Tạm ước 14/9/1946 - ta tranh thủ hòa hoãn
├── Đường lối kháng chiến (xanh lá nhạt)
│   ├── Toàn dân
│   ├── Toàn diện (chính trị, quân sự, kinh tế...)
│   ├── Trường kỳ (dài lâu)
│   └── Tự lực cánh sinh
├── Diễn biến chính (hồng nhạt)
│   ├── Toàn quốc kháng chiến 19/12/1946
│   ├── Chiến dịch Việt Bắc Thu - Đông 1947
│   ├── Chiến dịch Biên Giới Thu - Đông 1950
│   └── Chiến dịch Điện Biên Phủ 1954
├── Kết quả (vàng nhạt)
│   ├── Chiến thắng Điện Biên Phủ lịch sử
│   ├── Hiệp định Genève 7/1954
│   └── Giải phóng hoàn toàn miền Bắc
└── Ý nghĩa lịch sử (tím nhạt)
    ├── Củng cố chính quyền dân chủ nhân dân
    ├── Tạo tiền đề thống nhất đất nước
    └── Cổ vũ phong trào GPDT thế giới
```
#   M i n d M a p D e m o  
 