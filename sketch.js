// 具体的动画逻辑 - 使用AnimationLib中的通用组件
// 导入需要的函数和类
const {
    cfg,
    Line,
    setOrigin,
    animateParallel,
    resetObjects,
    animateWithXChange,
    recordParallelAnimation,
    recordSingleAnimation,
    recordXChangeSequence,
    renderAll
} = May;

// 设置坐标原点
setOrigin(3*cfg.width/16, 5*cfg.height/8);

// 具体的入场动画
async function animate() {
    var x = 0.4;
    var y = (5-3*x)/4;
    let line0 = new Line([0, 0], [0, 0], "A", "B", {hideText2: true});
    let line1 = new Line([3*x, 0], [3*x, 0], "B", "C", {hideDot1: false});
    
    // 同步执行line0和line1的动画
    await animateParallel([
        () => line0.moveEndDirectAsync([3*x, 0], 500),
        () => line1.moveEndDirectAsync([5, 0], 500)
    ]);

    let line2 = new Line([0, 0], [0, 0], "A", "D", {textPos2:"top", "hideText2": true});
    let line3 = new Line([5, 0], [5, 0], "C", "E", {textPos2:"top", "hideText2": true});

    // 同步执行line0和line1的动画
    await animateParallel([
        () => line2.moveEndDirectAsync([0, 3*y]),
        () => line3.moveEndDirectAsync([5, 4*x]),
    ]);

    line2.hideText2 = false;
    line3.hideText2 = false;
    
    let line4 = new Line([3*x,0],[0,3*y],"B","D", {"hideText1": true, "hideText2": true, color: 'rgba(0,0,0,0)'})
    let line5 = new Line([3*x,0],[5,4*x],"B","E", {"hideText1": true, "hideText2": true, color: 'rgba(0,0,0,0)'})
    await animateParallel([
        () => line4.colorAsync('#000000', 500),
        () => line5.colorAsync('#000000', 500),
    ]);

    let line6 = new Line([0,3*y], [0,3*y],"D","E", {"hideText1": true, "hideText2": true, color: 'rgba(255,0,0,1)'})
    await line6.moveEndDirectAsync([5, 4*x], 500)
}

// 具体的几何图形创建函数
function createGeometry(x) {
    let y = (5-3*x)/4;
    
    // 创建初始场景
    let line0 = new Line([0, 0], [3*x, 0], "A", "B", {hideText2: true});
    let line1 = new Line([3*x, 0], [5, 0], "B", "C", {hideDot1: false});
    let line2 = new Line([0, 0], [0, 3*y], "A", "D", {textPos2:"top"});
    let line3 = new Line([5, 0], [5, 4*x], "C", "E", {textPos2:"top"});
    let line4 = new Line([3*x, 0], [0, 3*y], "B", "D", {"hideText1": true, "hideText2": true});
    let line5 = new Line([3*x, 0], [5, 4*x], "B", "E", {"hideText1": true, "hideText2": true});
    let line6 = new Line([0, 3*y], [5, 4*x], "D", "E", {"hideText1": true, "hideText2": true, color: 'rgba(255,0,0,1)'});
    
    return {line0, line1, line2, line3, line4, line5, line6};
}

// 具体的X变化动画参数
const xrange = [
    {start: 0.4, end: 0.9, duration: 1000}, 
    {end: 0.6, duration: 1000}
];

// 播放全部动画（入场动画 + X变化动画）
async function playAll() {
    const playAllButton = document.getElementById('playAll');
    
    // 禁用按钮
    playAllButton.disabled = true;
    playAllButton.classList.add('playing');
    playAllButton.textContent = '播放中...';
    
    try {
        // 依次播放两个动画
        await animate(); // 先播放入场动画
        await animateWithXChange(xrange, createGeometry); // 再播放X变化动画
    } finally {
        // 重新启用按钮
        playAllButton.disabled = false;
        playAllButton.classList.remove('playing');
        playAllButton.textContent = '播放全部动画';
    }
}

// 录制动画并下载为zip文件
async function recordAnimation() {
    const recordButton = document.getElementById('recordAnimation');
    const playAllButton = document.getElementById('playAll');
    
    // 禁用所有按钮
    recordButton.disabled = true;
    playAllButton.disabled = true;
    recordButton.classList.add('playing');
    recordButton.textContent = '录制中...';
    
    const frames = [];
    
    // 创建zip文件
    const zip = new JSZip();
    
    try {
        // 重置对象
        resetObjects();
        
        // 开始录制入场动画
        await recordAnimateSequence(frames);
        
        // 开始录制X变化动画
        await recordXChangeSequence(frames, xrange, createGeometry);
        
        // 将帧添加到zip文件
        frames.forEach((frameData, index) => {
            // 将base64数据转换为二进制数据
            const binaryData = atob(frameData.split(',')[1]);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                bytes[i] = binaryData.charCodeAt(i);
            }
            zip.file(`frame_${String(index).padStart(4, '0')}.png`, bytes, {binary: true});
        });
        
        // 生成并下载zip文件
        const zipBlob = await zip.generateAsync({type: 'blob'});
        saveAs(zipBlob, 'animation_frames.zip');
        
    } finally {
        // 重新启用按钮
        recordButton.disabled = false;
        playAllButton.disabled = false;
        recordButton.classList.remove('playing');
        recordButton.textContent = '录制并下载';
    }
}

// 录制入场动画序列
async function recordAnimateSequence(frames) {
    var x = 0.4;
    var y = (5-3*x)/4;
    
    // 捕获初始帧
    frames.push(window.canvas.elt.toDataURL('image/png'));
    
    let line0 = new Line([0, 0], [0, 0], "A", "B", {hideText2: true});
    let line1 = new Line([3*x, 0], [3*x, 0], "B", "C", {hideDot1: false});
    
    // 录制line0和line1的动画
    await recordParallelAnimation([
        () => line0.moveEndDirectAsync([3*x, 0], 500),
        () => line1.moveEndDirectAsync([5, 0], 500)
    ], frames);
    
    let line2 = new Line([0, 0], [0, 0], "A", "D", {textPos2:"top", "hideText2": true});
    let line3 = new Line([5, 0], [5, 0], "C", "E", {textPos2:"top", "hideText2": true});

    // 录制line2和line3的动画
    await recordParallelAnimation([
        () => line2.moveEndDirectAsync([0, 3*y]),
        () => line3.moveEndDirectAsync([5, 4*x]),
    ], frames);

    line2.hideText2 = false;
    line3.hideText2 = false;
    
    let line4 = new Line([3*x,0],[0,3*y],"B","D", {"hideText1": true, "hideText2": true, color: 'rgba(0,0,0,0)'})
    let line5 = new Line([3*x,0],[5,4*x],"B","E", {"hideText1": true, "hideText2": true, color: 'rgba(0,0,0,0)'})
    
    // 录制line4和line5的颜色变化
    await recordParallelAnimation([
        () => line4.colorAsync('#000000', 500),
        () => line5.colorAsync('#000000', 500),
    ], frames);

    let line6 = new Line([0,3*y], [0,3*y],"D","E", {"hideText1": true, "hideText2": true, color: 'rgba(255,0,0,1)'})
    
    // 录制line6的移动
    await recordSingleAnimation(() => line6.moveEndDirectAsync([5, 4*x], 500), frames);
}

// p5.js 设置和绘制函数
function setup(){
    let canvas = createCanvas(cfg.width, cfg.height);
    canvas.parent('canvas-container');
    // 将canvas保存为全局变量
    window.canvas = canvas;
}

function draw(){
    renderAll();
}

// 页面加载完成后绑定按钮事件
window.addEventListener('load', function() {
    const playAllButton = document.getElementById('playAll');
    const recordButton = document.getElementById('recordAnimation');
    
    playAllButton.addEventListener('click', function() {
        resetObjects();
        playAll();
    });
    
    recordButton.addEventListener('click', function() {
        resetObjects();
        recordAnimation();
    });
    
    // 示例动画按钮
    const playMyAnimationButton = document.getElementById('playMyAnimation');
    playMyAnimationButton.addEventListener('click', function() {
        resetObjects();
        // 这里可以添加示例动画逻辑
        console.log('示例动画功能待实现');
    });
});