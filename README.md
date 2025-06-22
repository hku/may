# 动画库重构说明

## 重构目标
将原来的 `sketch.js` 文件重构为可复用的组件库，使得下次构建新动画时能够最大程度复用通用代码。

## 文件结构

### 1. `libs/animation-lib.js` - 通用动画库
包含所有可复用的组件和函数：

#### 核心类
- **Point类**: 可复用的点对象，支持移动、旋转等动画
- **Line类**: 可复用的线段对象，支持移动、旋转、颜色变化等动画

#### 配置函数
- `setOrigin(x, y)`: 设置坐标原点
- `setCanvasSize(width, height)`: 设置画布尺寸
- `setScale(scale)`: 设置缩放比例

#### 动画函数
- `animateParallel(animationFunctions)`: 并行执行多个动画
- `animateXSegment(startX, endX, duration, createGeometryFunc)`: 执行单个x值变化的动画片段
- `animateWithXChange(xrange, createGeometryFunc)`: 执行X变化动画序列

#### 录制函数
- `recordParallelAnimation(animationFunctions, frames)`: 录制并行动画
- `recordSingleAnimation(animationFunction, frames)`: 录制单个动画
- `recordXSegment(startX, endX, duration, frames, createGeometryFunc)`: 录制X段动画
- `recordXChangeSequence(frames, xrange, createGeometryFunc)`: 录制X变化动画序列

#### 工具函数
- `resetObjects()`: 重置所有对象到初始状态
- `renderAll()`: 渲染所有对象
- `toCanvasCoords(x, y)`: 坐标转换函数

### 2. `sketch.js` - 具体动画逻辑
现在只包含与具体动画内容相关的代码：

#### 配置部分
- 坐标原点设置
- 具体的几何图形创建函数 `createGeometry(x)`
- 具体的X变化动画参数 `xrange`

#### 动画部分
- 具体的入场动画 `animate()`
- 具体的播放函数 `playAll()`
- 具体的录制函数 `recordAnimation()`

#### p5.js 函数
- `setup()`: 画布初始化
- `draw()`: 渲染循环

## 使用方法

### 创建新动画的步骤

1. **引入库文件**
   ```html
   <script src="libs/animation-lib.js"></script>
   ```

2. **获取需要的组件**
   ```javascript
   const { Point, Line, setOrigin, animateParallel, resetObjects, animateWithXChange, renderAll } = window.AnimationLib;
   ```

3. **配置画布和坐标系统**
   ```javascript
   setOrigin(400, 300);  // 设置坐标原点
   ```

4. **定义几何图形创建函数**
   ```javascript
   function createMyGeometry(x) {
       // 根据参数x创建你的几何图形
       let pointA = new Point([0, 0], "A");
       let pointB = new Point([x, 0], "B");
       // ... 更多对象
       return { pointA, pointB };
   }
   ```

5. **定义入场动画**
   ```javascript
   async function myEntranceAnimation() {
       // 定义具体的入场动画逻辑
       let pointA = new Point([0, 0], "A");
       await pointA.moveDirectAsync([1, 1], 1000);
   }
   ```

6. **定义X变化动画参数**
   ```javascript
   const myXRange = [
       {start: 0, end: 4, duration: 2000},
       {end: 2, duration: 1000}
   ];
   ```

7. **定义播放函数**
   ```javascript
   async function playMyAnimation() {
       resetObjects();
       await myEntranceAnimation();
       await animateWithXChange(myXRange, createMyGeometry);
   }
   ```

8. **设置p5.js函数**
   ```javascript
   function setup() {
       let canvas = createCanvas(cfg.width, cfg.height);
       canvas.parent('canvas-container');
   }
   
   function draw() {
       renderAll();
   }
   ```

## 优势

1. **高度复用**: 所有通用的Point、Line类和动画函数都可以直接使用
2. **易于维护**: 通用代码集中在一个文件中，便于维护和更新
3. **快速开发**: 新动画只需要关注具体的几何图形和动画逻辑
4. **一致性**: 所有动画使用相同的组件，保证了一致的用户体验

## 示例

参考 `example-usage.js` 文件，展示了如何使用重构后的库创建新的动画。

## 注意事项

1. 确保在HTML中正确引入 `animation-lib.js`
2. 使用 `window.AnimationLib` 来访问库中的组件和函数
3. 每个新动画文件只需要关注具体的几何图形定义和动画逻辑
4. 所有通用的动画功能都已经在库中实现，无需重复编写 