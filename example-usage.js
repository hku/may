// 示例：如何使用重构后的动画库创建新的动画
// 这个文件展示了如何复用 animation-lib.js 中的组件

// 1. 首先在HTML中引入库文件（使用ES6模块）
// <script type="module" src="example-usage.js"></script>

// 2. 导入需要的函数和类
import {
    cfg,
    Point,
    Line,
    setCanvasSize,
    setOrigin,
    setScale,
    animateParallel,
    resetObjects,
    animateWithXChange,
    renderAll
} from './libs/animation-lib.js';

// 3. 配置画布和坐标系统
setCanvasSize(800, 600);  // 设置画布尺寸
setOrigin(400, 300);      // 设置坐标原点在画布中心
setScale(50);             // 设置缩放比例

// 4. 定义具体的几何图形创建函数
function createMyGeometry(x) {
    // 这里定义你的具体几何图形
    // 例如：创建一个随x变化的三角形
    
    let y = Math.sin(x) * 2;  // y随x变化
    
    // 创建三个点（使用Point）
    let pointA = new Point([0, 0], "A");
    let pointB = new Point([x, 0], "B");
    let pointC = new Point([x/2, y], "C");
    
    // 创建三条边（使用Line）
    let lineAB = new Line([0, 0], [x, 0], "A", "B");
    let lineBC = new Line([x, 0], [x/2, y], "B", "C");
    let lineCA = new Line([x/2, y], [0, 0], "C", "A");
    
    return { pointA, pointB, pointC, lineAB, lineBC, lineCA };
}

// 5. 定义入场动画
async function myEntranceAnimation() {
    // 创建初始状态（所有对象都在原点）
    let pointA = new Point([0, 0], "A");
    let pointB = new Point([0, 0], "B");
    let pointC = new Point([0, 0], "C");
    
    // 执行动画：点B移动到(2, 0)
    await pointB.moveDirectAsync([2, 0], 1000);
    
    // 执行动画：点C移动到(1, 1)
    await pointC.moveDirectAsync([1, 1], 1000);
    
    // 创建线段并设置初始颜色为透明
    let lineAB = new Line([0, 0], [2, 0], "A", "B", {color: 'rgba(0,0,0,0)'});
    let lineBC = new Line([2, 0], [1, 1], "B", "C", {color: 'rgba(0,0,0,0)'});
    let lineCA = new Line([1, 1], [0, 0], "C", "A", {color: 'rgba(0,0,0,0)'});
    
    // 并行执行颜色变化动画
    await animateParallel([
        () => lineAB.colorAsync('#000000', 500),
        () => lineBC.colorAsync('#000000', 500),
        () => lineCA.colorAsync('#000000', 500)
    ]);
}

// 6. 定义X变化动画参数
const myXRange = [
    {start: 0, end: 4, duration: 2000},
    {end: 2, duration: 1000},
    {end: 6, duration: 1500}
];

// 7. 定义完整的播放函数
async function playMyAnimation() {
    try {
        console.log('开始播放示例动画...');
        
        // 重置所有对象
        resetObjects();
        
        // 播放入场动画
        await myEntranceAnimation();
        
        // 播放X变化动画
        await animateWithXChange(myXRange, createMyGeometry);
        
        console.log('示例动画播放完成！');
        
    } catch (error) {
        console.error('动画播放出错:', error);
    }
}

// 8. p5.js 设置和绘制函数
function setup() {
    let canvas = createCanvas(cfg.width, cfg.height);
    canvas.parent('canvas-container');
    window.canvas = canvas;
    console.log('示例动画设置完成，画布尺寸:', cfg.width, 'x', cfg.height);
}

function draw() {
    renderAll();  // 使用库中的渲染函数
}

// 9. 绑定按钮事件
window.addEventListener('load', function() {
    console.log('页面加载完成，正在绑定示例动画按钮事件...');
    
    const playButton = document.getElementById('playMyAnimation');
    if (playButton) {
        console.log('找到示例动画按钮，绑定事件...');
        playButton.addEventListener('click', function() {
            console.log('示例动画按钮被点击');
            resetObjects();
            playMyAnimation();
        });
    } else {
        console.warn('未找到示例动画按钮');
    }
});

// 使用说明：
// 1. 复制这个文件并重命名为你的动画文件
// 2. 修改 createMyGeometry() 函数来定义你的几何图形
// 3. 修改 myEntranceAnimation() 函数来定义入场动画
// 4. 修改 myXRange 来定义X变化动画的参数
// 5. 在HTML中添加对应的按钮和容器
// 6. 所有通用的Point、Line类和动画函数都可以直接使用 