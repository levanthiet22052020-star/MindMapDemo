# Prompt: Tạo màn hình Mind Map React Native Expo

Prompt tổng hợp để tạo lại toàn bộ màn hình Mind Map trong project React Native Expo.

---

## Prompt gốc

Tạo project React Native Expo demo màn hình Mind Map cho bài học **Lịch sử 10 - Kháng chiến chống thực dân Pháp (1946-1954)** với các yêu cầu sau:

### 1. Cấu trúc project

```
MindMapDemo/
├── App.tsx
├── index.js
├── package.json
├── app.json
├── babel.config.js
├── tsconfig.json
└── src/
    ├── types/mindmap.ts
    ├── constants/theme.ts
    ├── utils/layout.ts
    ├── components/MindMap/index.tsx
    └── screens/MindMapScreen.tsx
```

### 2. Dependencies

```json
{
  "dependencies": {
    "expo": "^56.0.5",
    "react": "19.2.3",
    "react-native": "0.85.3",
    "react-native-gesture-handler": "~2.31.1",
    "react-native-reanimated": "4.3.1",
    "react-native-svg": "15.15.4",
    "react-native-safe-area-context": "~5.7.0",
    "@expo/vector-icons": "^15.0.2",
    "expo-status-bar": "~56.0.4"
  }
}
```

### 3. Data types (`src/types/mindmap.ts`)

```ts
export interface MindMapNode {
  id: string;
  text: string;
  subtitle?: string;
  x: number;
  y: number;
  color: string;
  textColor?: string;
  children: string[];
  parentId: string | null;
  collapsed?: boolean;
}

export interface MindMapData {
  nodes: Record<string, MindMapNode>;
  rootId: string;
}
```

### 4. Theme (`src/constants/theme.ts`)

- Primary color: `#7C5CFC` (tím)
- 6 BranchColors (tím, xanh dương, cam, xanh lá, vàng, hồng) - mỗi nhánh có bg, border, accent
- NodeConfig: rootWidth=164, nodeWidth=132, subNodeWidth=122, horizontalGap=48, verticalGap=14

### 5. Layout algorithm (`src/utils/layout.ts`)

- Tree layout: root bên trái, nhánh mở sang phải
- `getNodeSize()` trả về kích thước theo level (root / branch / sub-node)
- `getSubtreeHeight()` tính chiều cao subtree đệ quy
- `getOrganicOffset()` tạo offset nhẹ (-6, +4, -3, +5...) cho nhánh con → bố cục sinh động
- `assignBranch()` gán branchIndex cho tất cả node trong nhánh
- `calculateLayout()` trả về Record<string, LayoutNode> với x, y, width, height, branchIndex
- `createInitialData()` tạo 22 node cho bài Kháng chiến chống Pháp (5 nhánh: Bối cảnh, Đường lối, Diễn biến, Kết quả, Ý nghĩa)

### 6. MindMap component (`src/components/MindMap/index.tsx`)

**Props:**
- `data: MindMapData`
- `onDataChange: (data: MindMapData) => void`
- `onFitReady?: (fitFn: () => void) => void`

**Coordinate normalization (QUAN TRỌNG - chống clipping):**
- Hàm `normalizeLayout()` dịch toàn bộ tọa độ raw về vùng dương
- Tính `rawMinX`, `rawMinY` từ layout gốc
- Offset = `SAFE_PAD(48) - rawMinX` / `SAFE_PAD - rawMinY`
- Mọi node: `x + offX`, `y + offY`
- contentWidth/Height bao gồm EXTRA_RIGHT (nút "+") và SAFE_PAD

**Auto-fit:**
- `computeFit()` chạy khi container/layout thay đổi
- Dùng `onLayout` lấy kích thước container thực tế
- fitScale = min(containerW - pad*2 / contentW, containerH - pad*2 / contentH, 1.15)
- Clamp: desktop min 0.4, mobile min 0.35
- `userInteracted` ref: true khi user pan/zoom, false khi collapse/add node → auto re-fit
- `onFitReady` callback cho toolbar button reset pan/zoom

**Gestures:**
- `Gesture.Simultaneous(pinch, pan)` - chạy đồng thời
- Pinch: clamp scale ngay trong onUpdate (min = fitScale*0.3, max = fitScale*3)
- Pan: update translateX/Y, save trên onEnd
- Dùng `runOnJS` cho setUser (reanimated v4)

**SVG rendering:**
- SVG width/height = container dimensions, viewBox = "0 0 cw ch"
- LinearGradient cho root node (#7C5CFC → #B4A0FF)
- FeDropShadow cho node (floodColor tím, opacity 0.08) và root (opacity 0.22)
- Decorative blobs: 4 Circle với opacity 3-4% tạo chiều sâu
- Connections: organic bezier curve (`M...C...`) với control point lệch theo dy
  - Màu theo branch accent color, opacity 0.35
- Nodes: rect bo góc (rootRadius=24, nodeRadius=14, subNodeRadius=12)
  - Root: fill gradient, shadow mạnh
  - Branch node: left accent bar 3px màu accent, viền theo branch border
  - Sub-node: nền trắng, viền nhạt
- Text: ForeignObject + RN Text, numberOfLines=2, căn giữa
- Add button: ForeignObject bên phải node, viền tím nền nhạt (#EDE8FF)
- Collapse toggle: ForeignObject trong node góc phải, nền #F5F2FF, icon ▴/▾

### 7. MindMapScreen (`src/screens/MindMapScreen.tsx`)

**Header (tím gradient):**
- Top row: back button + avatar "Đ" + pills (Đồng I, 1,250 coin, 🔥5)
- Breadcrumb: "LỊCH SỬ 10 > CHƯƠNG I"
- Title: "Sự học và đời sống" + subtitle "Mind map"
- borderBottomLeftRadius/RightRadius: 20

**Map container:**
- flex: 1, overflow: hidden, background trắng
- Toolbar overlay (position: absolute, top: 12, right: 12, zIndex: 10):
  - Nút fit view (scan-outline icon, shadow tím)
  - Nút menu 3 chấm

**SafeAreaView** wrapper, StatusBar light-content

### 8. Dữ liệu mẫu

```
Root: Kháng chiến chống Pháp (1946-1954)
├── Bối cảnh lịch sử (tím nhạt #F0EDFF)
│   ├── Pháp quay lại xâm lược VN
│   ├── Hiệp định Sơ bộ 6/3/1946
│   └── Tạm ước 14/9/1946
├── Đường lối kháng chiến (xanh dương #EDF7FF)
│   ├── Toàn dân
│   ├── Toàn diện
│   ├── Trường kỳ
│   └── Tự lực cánh sinh
├── Diễn biến chính (cam #FFF5EC)
│   ├── Toàn quốc kháng chiến 12/1946
│   ├── Việt Bắc Thu - Đông 1947
│   ├── Biên Giới Thu - Đông 1950
│   └── Điện Biên Phủ 1954
├── Kết quả (xanh lá #EDFFF4)
│   ├── Chiến thắng ĐBP lịch sử
│   ├── Hiệp định Genève 7/1954
│   └── Giải phóng miền Bắc
└── Ý nghĩa lịch sử (vàng #FFF8E1)
    ├── Củng cố chính quyền
    ├── Tiền đề thống nhất
    └── Cổ vũ GPDT thế giới
```

---

## Các prompt sửa lỗi đã dùng

### Fix responsive/overflow

```
Sửa mind map bị tràn màn hình trên web desktop và biến mất trên mobile.
- SVG dùng đúng kích thước container (onLayout)
- Bỏ hardcoded SVG min size (800x600)
- Auto-fit dựa trên container size thực tế
- clamp pinch trong onUpdate không đợi onEnd
```

### Fix clipping (node bị cắt mép)

```
Mind map bị cắt ở mép trái và mép trên. Layout tạo tọa độ âm.
Fix: tạo hàm normalizeLayout() dịch toàn bộ tọa độ về vùng dương.
- offset = SAFE_PAD - rawMinX
- Mọi node: x + offX, y + offY
- Bounds bao gồm nút "+", collapse, shadow, bezier
- contentWidth/Height tính trên normalized coordinates
```

### Fix blank screen

```
Bug: normalizeLayout() trả về { nodes } nhưng destructuring dùng { normalizedNodes }.
Fix: { nodes: normalizedNodes, contentWidth, contentHeight }
```

### Upgrade Expo SDK

```
Expo Go SDK 54 không tương thích project SDK 52.
Fix: npx expo install expo@latest, npx expo install --fix, npm install --legacy-peer-deps
Bỏ newArchEnabled khỏi app.json (không hợp lệ SDK 56).
```
