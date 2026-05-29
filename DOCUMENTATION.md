# Mind Map Demo - Tài liệu kỹ thuật

## Tổng quan dự án

Ứng dụng Mind Map tương tác trên mobile, hiển thị sơ đồ tư duy cho bài học Lịch sử (Kháng chiến chống thực dân Pháp 1946-1954). Hỗ trợ phóng to/thu nhỏ, kéo di chuyển, thêm/xoá node, thu gọn/mở rộng nhánh.

---

## Công nghệ sử dụng

### Core Framework
| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| **Expo SDK** | 56.0.5 | Framework cross-platform (iOS, Android, Web) |
| **React Native** | 0.85.3 | UI framework |
| **React** | 19.2.3 | Thư viện UI |
| **TypeScript** | 5.3 | Type safety |

### Thư viện chính
| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| **react-native-svg** | 15.15.4 | Render SVG: node, đường nối, gradient, bóng đổ |
| **react-native-gesture-handler** | 2.31.1 | Xử lý cử chỉ: pinch zoom, pan/drag |
| **react-native-reanimated** | 4.3.1 | Animation mượt 60fps cho zoom/pan |
| **react-native-safe-area-context** | 5.7.0 | Xử lý safe area cho thiết bị có notch |
| **@expo/vector-icons** | 15.0.2 | Icon (Ionicons) cho UI |
| **zod** | 4.4.3 | Schema validation |

### Tại sao chọn các thư viện này?
- **react-native-svg**: SVG cho phép vẽ bezier curves, gradient, shadow — không thể làm bằng View thuần
- **react-native-reanimated**: Chạy animation trên UI thread → 60fps mượt, không bị giật khi JS thread bận
- **react-native-gesture-handler**: Xử lý gesture tốt hơn React Native built-in, hỗ trợ pinch + pan đồng thời
- **Expo**: Không cần config native code, build nhanh, hỗ trợ web

---

## Cấu trúc thư mục

```
MindMapDemo/
├── App.tsx                          # Entry point → render MindMapScreen
├── index.js                         # Expo registration (registerRootComponent)
├── package.json                     # Dependencies
├── app.json                         # Expo config (name, platforms, orientation)
├── babel.config.js                  # Babel preset Expo + Reanimated plugin
├── tsconfig.json                    # TypeScript strict mode
└── src/
    ├── types/
    │   └── mindmap.ts               # Type definitions
    ├── constants/
    │   └── theme.ts                 # Colors, BranchColors, NodeConfig
    ├── utils/
    │   └── layout.ts                # Thuật toán layout + sample data
    ├── components/
    │   └── MindMap/
    │       └── index.tsx            # Component chính: SVG + Gesture + Animation
    └── screens/
        └── MindMapScreen.tsx        # Màn hình chính: Header + Toolbar + MindMap
```

---

## TypeScript Types

```typescript
// Mỗi node trong mind map
interface MindMapNode {
  id: string;              // Unique ID
  text: string;            // Nội dung hiển thị
  subtitle?: string;       // Phụ đề (tuỳ chọn)
  x: number; y: number;   // Toạ độ (tính bởi layout algorithm)
  color: string;           // Màu nền
  textColor?: string;      // Màu chữ
  children: string[];      // Danh sách ID node con
  parentId: string | null; // null = root node
  collapsed?: boolean;     // true = thu gọn nhánh
}

// Toàn bộ data mind map
interface MindMapData {
  nodes: Record<string, MindMapNode>; // Map<ID, Node>
  rootId: string;                      // ID node gốc
}
```

---

## Thuật toán Layout

**File**: `src/utils/layout.ts`

### Cách hoạt động (3 bước)

**Bước 1 — Tính chiều cao subtree** (`getSubtreeHeight`)
```
- Nếu node là lá hoặc bị collapse → trả về height + verticalGap
- Nếu có children → đệ quy tính tổng chiều cao tất cả children
- Đảm bảo subtree >= chiều cao chính node đó
```

**Bước 2 — Đặt vị trí node** (`layoutSubtree` - đệ quy)
```
- Root nằm bên trái, các nhánh mở rộng sang phải
- Mỗi nhánh con được căn giữa theo subtree của nó
- offset hữu cơ (organic offset): thêm +/- vài pixel cho tự nhiên
- Cấp node quyết định kích thước:
  + Root: 164×48, border radius 24
  + Branch (con trực tiếp root): 132×42, radius 14
  + Leaf (cháu trở đi): 122×36, radius 12
```

**Bước 3 — Normalise toạ độ** (`normalizeLayout` trong component)
```
- Tìm minX, minY của toàn bộ layout
- Dịch chuyển tất cả toạ độ để bắt đầu từ (48, 48)
- Thêm padding phải 30px cho nút "+"
- Trả về: nodes (đã chuẩn hoá), contentWidth, contentHeight
```

### Tại sao cần normalise?
SVG không hiển thị toạ độ âm tốt → dịch tất cả sang dương, đảm bảo không bị clip.

---

## SVG Rendering Pipeline

**File**: `src/components/MindMap/index.tsx`

### Các lớp render (từ dưới lên trên)

```
1. <Defs> — Gradient & Shadow filters
   ├── LinearGradient "rootGrad" (tím #7C5CFC → #B4A0FF)
   ├── Filter "sh" — shadow nhẹ cho node thường
   └── Filter "shR" — shadow đậm cho root node

2. Decorative blobs — 4 vòng tròn lớn, mờ
   └── Màu: tím nhạt, xanh nhạt, hồng nhạt (opacity ~4%)

3. Connections — Đường nối Bezier giữa các node
   └── Công thức: M → C (2 control points) → End
   └── Màu theo branchIndex, opacity 0.35, strokeWidth 2

4. Nodes — Mỗi node gồm:
   ├── <Rect> — Hình chữ nhật bo góc + shadow
   ├── <Rect> stroke — Viền theo branch color
   ├── <Rect> accent bar — Thanh màu bên trái (branch node)
   ├── <ForeignObject> — Text (React Native <Text>)
   ├── <ForeignObject> — Nút "+" thêm node con
   └── <ForeignObject> — Nút ▴/▾ thu gọn/mở rộng
```

### Đường Bezier - Control Points
```typescript
// Từ điểm bắt đầu (sx, sy) đến điểm kết thúc (ex, ey)
d={`M${sx},${sy}
   C${sx + dx*0.4},${sy + dy*0.05}    // Control 1: gần như ngang
    ${ex - dx*0.35},${ey - dy*0.05}    // Control 2: tiệm cận đích
    ${ex},${ey}`}                       // End point
```
→ Tạo đường cong organic, không gãy khúc.

### ForeignObject là gì?
- Cho phép nhúng React Native View bên trong SVG
- Dùng để render `<Text>`, `<TouchableOpacity>` trong node
- Cần vì SVG `<Text>` không hỗ trợ style phức tạp

---

## Gesture & Animation System

### Pinch Gesture (Zoom bằng 2 ngón)
```typescript
const pinch = Gesture.Pinch()
  .onUpdate((e) => {
    // Giới hạn zoom: 30% → 300% fitScale
    scale.value = clamp(savedScale * e.scale, minS, maxS);
  })
  .onEnd(() => { savedScale = scale; });
```

### Pan Gesture (Kéo di chuyển)
```typescript
const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX = savedTX + e.translationX;
    translateY = savedTY + e.translationY;
  })
  .onEnd(() => { savedTX = translateX; savedTY = translateY; });
```

### Kết hợp Gesture
```typescript
const gesture = Gesture.Simultaneous(pinch, pan);
// Cho phép pinch + pan đồng thời (không block nhau)
```

### Nút Zoom (+/−)
```typescript
// Zoom factor: 1.3× mỗi lần nhấn
// Zoom vào giữa màn hình:
const ratio = newScale / savedScale;
const newTX = cx - ratio * (cx - savedTX);  // cx = container center X
const newTY = cy - ratio * (cy - savedTY);
// Animation: withTiming(250ms)
```

### Auto-fit Algorithm
```typescript
// Tính scale vừa khít container:
fitScale = Math.min(
  (width - padding) / contentWidth,
  (height - padding) / contentHeight,
  mobile ? 1 : 1.15        // Giới hạn trên mobile
);
// Clamp: min 0.35-0.4
// Center: offset = (container - content*scale) / 2
// Animation: withTiming(350ms)
```

---

## State Management

### Pattern: Lifted State
```
MindMapScreen (owns state)
  ├── data: MindMapData          ← useState
  ├── setData: callback          ← truyền xuống MindMap
  └── refs: fitViewFn, zoomInFn, zoomOutFn
            ↑ nhận từ MindMap qua callbacks

MindMap (receives props)
  ├── data, onDataChange         ← nhận từ parent
  ├── scale, translateX, translateY  ← useSharedValue (Reanimated)
  ├── containerSize              ← useState (từ onLayout)
  └── userInteracted, fitScaleRef    ← useRef (không re-render)
```

### Tại sao dùng pattern này?
- **Single source of truth**: Data nằm ở Screen, MindMap chỉ nhận props
- **Immutable updates**: Dùng spread operator `{ ...data, nodes }` → dễ debug
- **Ref-based callbacks**: MindMap expose hàm (zoomIn, fit) qua callback → Screen gọi được

### Reanimated Shared Values vs useState
| | useState | useSharedValue |
|---|---|---|
| **Chạy trên** | JS Thread | UI Thread |
| **Re-render?** | Có | Không |
| **Dùng cho** | Data, UI state | Animation values |
| **Truy cập** | `.value` trong component | `.value` trong worklet |

---

## Theme System

**File**: `src/constants/theme.ts`

### 6 Branch Colors (mỗi nhánh 1 màu)
```typescript
const BranchColors = [
  { bg: '#F0EDFF', border: '#D5CCFF', accent: '#7C5CFC' }, // Tím
  { bg: '#EDF7FF', border: '#C8E2FF', accent: '#0984E3' }, // Xanh dương
  { bg: '#FFF5EC', border: '#FFE0C2', accent: '#E17055' }, // Cam
  { bg: '#EDFFF4', border: '#C8F5D8', accent: '#00B894' }, // Xanh lá
  { bg: '#FFF8E1', border: '#FFECB3', accent: '#FDCB6E' }, // Vàng
  { bg: '#FFF0F5', border: '#FFC8D9', accent: '#FD79A8' }, // Hồng
];
// Gán theo branchIndex % 6 → lặp lại nếu > 6 nhánh
```

---

## Các câu hỏi phỏng vấn thường gặp & Trả lời

### Q: Tại sao dùng SVG thay vì Canvas?
**A:** react-native-svg cho phép nhúng React Native components qua `ForeignObject` (Text, TouchableOpacity). Canvas thuần không hỗ trợ interaction với từng element. SVG cũng dễ style hơn (gradient, filter, shadow).

### Q: Tại sao dùng Reanimated thay vì Animated mặc định?
**A:** Reanimated chạy animation trên UI thread → 60fps mượt, không bị giật khi JS thread bận. Animated mặc định chạy trên JS thread → dễ bị stutter. Reanimated cũng hỗ trợ worklet và `useSharedValue` hiệu quả hơn.

### Q: Gesture.Simultaneous là gì?
**A:** Cho phép nhiều gesture hoạt động đồng thời. Mặc định Gesture Handler chỉ cho 1 gesture.active. Với Simultaneous, pinch và pan có thể cùng lúc — zoom + di chuyển.

### Q: runOnJS dùng để làm gì?
**A:** Reanimated worklet chạy trên UI thread, không thể gọi JS function trực tiếp. `runOnJS(setUser)()` bridge từ UI thread sang JS thread để cập nhật ref.

### Q: useMemo và useCallback khác gì?
**A:**
- `useMemo`: Cache **giá trị** (object, array). Dùng cho layout calculation nặng.
- `useCallback`: Cache **function reference**. Dùng cho event handler truyền xuống child.

### Q: Thuật toán layout hoạt động thế nào?
**A:** 3 bước: (1) Đệ quy tính chiều cao subtree mỗi node. (2) Đặt vị trí root bên trái, children mở sang phải, căn giữa theo subtree. (3) Normalise toạ độ âm thành dương để SVG không bị clip.

### Q: Tại sao cần normalise toạ độ?
**A:** Layout algorithm đặt root ở (24, subtreeHeight/2) → children có thể có toạ độ âm. SVG không render tốt toạ độ âm. Normalise dịch tất cả sang (48, 48) trở lên.

### Q: useRef vs useState khi nào dùng?
**A:** `useRef` cho giá trị không cần re-render khi thay đổi (fitScaleRef, userInteracted). `useState` cho giá trị cần trigger re-render (data, containerSize).

### Q: ForeignObject trong SVG là gì?
**A:** Element cho phép nhúng foreign XML/HTML vào SVG. Trong RN, dùng để nhúng View, Text, TouchableOpacity vào trong SVG element → có thể handle press events.

### Q: Pattern Lifted State là gì?
**A:** State được quản lý ở component cha (MindMapScreen), truyền xuống con qua props. Con notify cha qua callback (onDataChange). Đảm bảo single source of truth.

### Q: Performance optimisation nào đã dùng?
**A:**
1. `useMemo` cache layout calculation (chạy lại chỉ khi data thay đổi)
2. `useCallback` stable function references
3. `useSharedValue` animation trên UI thread, không trigger re-render
4. Visibility filtering — chỉ render node visible (không bị collapse)
5. `useRef` cho giá trị không cần re-render

### Q: Zoom về giữa màn hình hoạt động thế nào?
**A:** Tính ratio = newScale / oldScale. Dùng công thức: newTranslation = center − ratio × (center − oldTranslation). Đảm bảo điểm giữa container giữ nguyên vị trí sau zoom.

---

## Cấu hình quan trọng

### Babel Config
```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],  // BẮT BUỘC cho Reanimated
};
```
→ Plugin phải nằm **cuối cùng** trong plugins array.

### TypeScript Config
```json
{
  "strict": true,           // Bật strict mode
  "paths": { "@/*": ["src/*"] },  // Path alias
  "jsx": "react-jsx"        // React 17+ automatic runtime
}
```

### Expo Config
```json
{
  "platforms": ["ios", "android", "web"],
  "orientation": "default",
  "userInterfaceStyle": "light"
}
```
