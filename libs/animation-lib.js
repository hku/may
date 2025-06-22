// 通用动画库 - 可复用的几何图形和动画组件

// 全局对象存储
let objs = {};

// 配置对象
let cfg = {
    width: 800, //canvas width
    height: 800,
    scale: 100 //放大数学坐标scale倍在canvas上绘制
};

// 坐标转换函数
function toCanvasCoords(x, y) {
    // 数学坐标 (0,0) -> origin，y轴向上，支持缩放
    let origin = cfg.origin;
    let scale = cfg.scale;
    return [origin[0] + x * scale, origin[1] - y * scale];
}

// 设置坐标原点
function setOrigin(x, y) {
    cfg.origin = [x, y];
}

// 设置画布尺寸
function setCanvasSize(width, height) {
    cfg.width = width;
    cfg.height = height;
}

// 设置缩放比例
function setScale(scale) {
    cfg.scale = scale;
}

// Point类 - 可复用的点对象
class Point {
    constructor(position, label="A", opt={}) {
        opt = Object.assign({}, {color: "#000", radius: 0.5}, opt);

        this.radius = opt.radius;
        this.color = opt.color;
        this.label = label;
        this.position = position; // [x, y]
        this.textPos = opt.textPos || "bottom"; // 默认为bottom
        this.fontSize = opt.fontSize || 18; // 新增，默认18
        this.hide = !!opt.hide; // 新增
        this.hideText = !!opt.hideText; // 新增
        let name = opt.name?opt.name:label;
        objs[name] = this;
    }
    
    async moveDirectAsync(target, duration=1000) {
        const startPos = [...this.position];
        const targetPos = [...target];
        const startTime = performance.now();

        return new Promise(resolve => {
            const moveStep = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                this.position[0] = startPos[0] + (targetPos[0] - startPos[0]) * t;
                this.position[1] = startPos[1] + (targetPos[1] - startPos[1]) * t;

                if (t < 1) {
                    requestAnimationFrame(moveStep);
                } else {
                    this.position = targetPos;
                    resolve();
                }
            };
            requestAnimationFrame(moveStep);
        });
    }
    
    async rotateAsync(center, angleDeg, duration=1000) {
        // 计算当前点到圆心的半径和起始角度
        let cx = center[0], cy = center[1];
        let px = this.position[0], py = this.position[1];
        let dx = px - cx, dy = py - cy;
        let r = Math.sqrt(dx*dx + dy*dy);
        let startAngle = Math.atan2(dy, dx); // 弧度
        let angleRad = angleDeg * Math.PI / 180;
        
        const startTime = performance.now();

        return new Promise(resolve => {
            const arcStep = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                let currentAngle = startAngle + angleRad * t;
                this.position[0] = cx + r * Math.cos(currentAngle);
                this.position[1] = cy + r * Math.sin(currentAngle);

                if (t < 1) {
                    requestAnimationFrame(arcStep);
                } else {
                    const finalAngle = startAngle + angleRad;
                    this.position[0] = cx + r * Math.cos(finalAngle);
                    this.position[1] = cy + r * Math.sin(finalAngle);
                    resolve();
                }
            };
            requestAnimationFrame(arcStep);
        });
    }
    
    render(){
        if (this.hide) return; // 新增
        const [cx, cy] = toCanvasCoords(this.position[0], this.position[1]);
        stroke(this.color);
        fill(this.color);
        let scale = cfg.scale; 
        ellipse(cx, cy, 2*this.radius*scale, 2*this.radius*scale);
        
        if(this.label && !this.hideText) { // 新增
            noStroke();
            fill(this.color);
            let offsetX = 0, offsetY = 0;
            let r = this.radius * scale;
            switch(this.textPos) {
                case "top":
                    offsetY = -r - 10;
                    break;
                case "bottom":
                    offsetY = r;
                    break;
                case "left":
                    offsetX = -r - 10;
                    break;
                case "right":
                    offsetX = r + 10;
                    break;
                case "center":
                    offsetY = 0;
                    break;
                default:
                    offsetY = r;
            }
            textAlign(CENTER, TOP);
            textSize(this.fontSize); // 新增，设置字体大小
            text(this.label, cx + offsetX, cy + offsetY);
        }
    }
}

// Line类 - 可复用的线段对象
class Line {
    constructor(start, end, startLabel = 'A', endLabel = 'B', opt={}) {
        opt = Object.assign({}, {
            fontSize: 18,
            hide: false,
            hideText1: false,
            hideText2: false,
            textPos1: "bottom",
            textPos2: "bottom",
            color:'#000', 
            weight:2,
            hideDot1: true,
            hideDot2: true
        }, opt);

        this.start = start.slice(); // [x, y]
        this.end = end.slice();     // [x, y]
        this.startLabel = startLabel;
        this.endLabel = endLabel;

        this.color = opt.color;
        this.weight = opt.weight;
        this.fontSize = opt.fontSize || 18; // 新增，默认18
        this.textPos1 = opt.textPos1 || "bottom"; // 新增，默认bottom
        this.textPos2 = opt.textPos2 || "bottom"; // 新增，默认bottom
        this.hide = !!opt.hide; // 新增
        this.hideText1 = !!opt.hideText1; // 新增，控制startLabel
        this.hideText2 = !!opt.hideText2; // 新增，控制endLabel
        this.hideDot1 = !!opt.hideDot1; // 新增，控制start点
        this.hideDot2 = !!opt.hideDot2; // 新增，控制end点
        let name = opt.name?opt.name:(startLabel + endLabel);
        objs[name] = this;
    }
    
    async colorAsync(targetColor, duration = 1000) {
        const startP5Color = color(this.color.toString()); // Ensure it's a string for p5.color()
        const endP5Color = color(targetColor);
        const startTime = performance.now();

        return new Promise(resolve => {
            const colorStep = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                this.color = lerpColor(startP5Color, endP5Color, t);

                if (t < 1) {
                    requestAnimationFrame(colorStep);
                } else {
                    this.color = targetColor;
                    resolve();
                }
            };
            requestAnimationFrame(colorStep);
        });
    }
    
    async moveEndDirectAsync(target, duration = 1000) {
        const startPos = [...this.end];
        const targetPos = [...target];
        const startTime = performance.now();

        return new Promise(resolve => {
            const moveStep = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                this.end[0] = startPos[0] + (targetPos[0] - startPos[0]) * t;
                this.end[1] = startPos[1] + (targetPos[1] - startPos[1]) * t;

                if (t < 1) {
                    requestAnimationFrame(moveStep);
                } else {
                    this.end = targetPos;
                    resolve();
                }
            };
            requestAnimationFrame(moveStep);
        });
    }
    
    async rotateAsync(center = null, angleDeg = 90, duration = 1000) {
        // 默认圆心为线段起点
        if (center === null) {
            center = this.start.slice();
        }
        let cx = center[0], cy = center[1];
        // 计算终点相对于圆心的半径和起始角度
        let dx = this.end[0] - cx, dy = this.end[1] - cy;
        let r = Math.sqrt(dx * dx + dy * dy);
        let startAngle = Math.atan2(dy, dx);
        let angleRad = angleDeg * Math.PI / 180;
        
        const startTime = performance.now();

        return new Promise(resolve => {
            const rotateStep = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);

                let currentAngle = startAngle + angleRad * t;
                this.end[0] = cx + r * Math.cos(currentAngle);
                this.end[1] = cy + r * Math.sin(currentAngle);
                if (t < 1) {
                    requestAnimationFrame(rotateStep);
                } else {
                    const finalAngle = startAngle + angleRad;
                    this.end[0] = cx + r * Math.cos(finalAngle);
                    this.end[1] = cy + r * Math.sin(finalAngle);
                    resolve();
                }
            };
            rotateStep();
        });
    }
    
    render() {
        if (this.hide) return; // 新增
        const [sx, sy] = toCanvasCoords(this.start[0], this.start[1]);
        const [ex, ey] = toCanvasCoords(this.end[0], this.end[1]);
        stroke(this.color);

        strokeWeight(this.weight);
        line(sx, sy, ex, ey);
        
        // 绘制端点dots
        if (!this.hideDot1) {
            noStroke();
            fill(this.color);
            ellipse(sx, sy, 8, 8);
        }
        
        if (!this.hideDot2) {
            noStroke();
            fill(this.color);
            ellipse(ex, ey, 8, 8);
        }
        
        // 绘制端点label
        noStroke();
        fill(this.color);
        textSize(this.fontSize); // 新增，设置字体大小
        // startLabel
        if (this.startLabel && !this.hideText1) { // 新增
            let offsetX1 = 0, offsetY1 = 0;
            let r = 8; // 线端点label的默认半径像素
            switch(this.textPos1) {
                case "top":
                    offsetY1 = -r - 10;
                    break;
                case "bottom":
                    offsetY1 = r;
                    break;
                case "left":
                    offsetX1 = -r - 10;
                    break;
                case "right":
                    offsetX1 = r + 10;
                    break;
                case "center":
                    offsetY1 = 0;
                    break;
                default:
                    offsetY1 = r;
            }
            textAlign(CENTER, TOP);
            text(this.startLabel, sx + offsetX1, sy + offsetY1);
        }
        // endLabel
        if (this.endLabel && !this.hideText2) { // 新增
            let offsetX2 = 0, offsetY2 = 0;
            let r = 8;
            switch(this.textPos2) {
                case "top":
                    offsetY2 = -r - 10;
                    break;
                case "bottom":
                    offsetY2 = r;
                    break;
                case "left":
                    offsetX2 = -r - 10;
                    break;
                case "right":
                    offsetX2 = r + 10;
                    break;
                case "center":
                    offsetY2 = 0;
                    break;
                default:
                    offsetY2 = r;
            }
            textAlign(CENTER, TOP);
            text(this.endLabel, ex + offsetX2, ey + offsetY2);
        }
    }
}

// 通用动画函数

// 并行执行多个动画
async function animateParallel(animationFunctions) {
    const promises = animationFunctions.map(func => func());
    await Promise.all(promises);
}

// 重置所有对象到初始状态
function resetObjects() {
    for (const key in objs) {
        if (objs.hasOwnProperty(key)) {
          delete objs[key];
        }
    }
}

// 执行单个x值变化的动画片段
async function animateXSegment(startX, endX, duration, createGeometryFunc) {
    const startTime = performance.now();
    
    return new Promise(resolve => {
        const animateStep = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数让动画更自然
            const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            // 计算当前x值
            const currentX = startX + (endX - startX) * easeT;
            
            // 重置所有对象并重新创建几何图形
            resetObjects();
            createGeometryFunc(currentX);
            
            if (t < 1) {
                requestAnimationFrame(animateStep);
            } else {
                // 确保最终位置精确
                resetObjects();
                createGeometryFunc(endX);
                resolve();
            }
        };
        requestAnimationFrame(animateStep);
    });
}

// 执行X变化动画序列
async function animateWithXChange(xrange, createGeometryFunc) {
    // 执行动画序列
    for (let i = 0; i < xrange.length; i++) {
        const segment = xrange[i];
        const startX = i === 0 ? segment.start : xrange[i-1].end;
        const endX = segment.end;
        const duration = segment.duration;
        
        await animateXSegment(startX, endX, duration, createGeometryFunc);
    }
}

// 录制相关函数

// 录制并行动画
async function recordParallelAnimation(animationFunctions, frames) {
    const promises = animationFunctions.map(func => func());
    await Promise.all(promises);
    
    // 捕获完成后的帧
    frames.push(window.canvas.elt.toDataURL('image/png'));
}

// 录制单个动画
async function recordSingleAnimation(animationFunction, frames) {
    await animationFunction();
    
    // 捕获完成后的帧
    frames.push(window.canvas.elt.toDataURL('image/png'));
}

// 录制X段动画
async function recordXSegment(startX, endX, duration, frames, createGeometryFunc) {
    const startTime = performance.now();
    const frameInterval = 1000 / 30; // 30 FPS
    let lastFrameTime = startTime;
    
    return new Promise(resolve => {
        const animateStep = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数让动画更自然
            const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            // 计算当前x值
            const currentX = startX + (endX - startX) * easeT;
            
            // 重置所有对象并重新创建几何图形
            resetObjects();
            createGeometryFunc(currentX);
            
            // 按30FPS捕获帧
            if (now - lastFrameTime >= frameInterval) {
                frames.push(window.canvas.elt.toDataURL('image/png'));
                lastFrameTime = now;
            }
            
            if (t < 1) {
                requestAnimationFrame(animateStep);
            } else {
                // 确保最终位置精确
                resetObjects();
                createGeometryFunc(endX);
                
                // 捕获最终帧
                frames.push(window.canvas.elt.toDataURL('image/png'));
                resolve();
            }
        };
        requestAnimationFrame(animateStep);
    });
}

// 录制X变化动画序列
async function recordXChangeSequence(frames, xrange, createGeometryFunc) {
    // 执行动画序列
    for (let i = 0; i < xrange.length; i++) {
        const segment = xrange[i];
        const startX = i === 0 ? segment.start : xrange[i-1].end;
        const endX = segment.end;
        const duration = segment.duration;
        
        await recordXSegment(startX, endX, duration, frames, createGeometryFunc);
    }
}

// 通用渲染函数
function renderAll() {
    clear();
    for (let obj of Object.values(objs)) {
        obj.render();
    }
}

// 导出所有公共接口
window.AnimationLib = {
    Point,
    Line,
    objs,
    cfg,
    toCanvasCoords,
    setOrigin,
    setCanvasSize,
    setScale,
    animateParallel,
    resetObjects,
    animateXSegment,
    animateWithXChange,
    recordParallelAnimation,
    recordSingleAnimation,
    recordXSegment,
    recordXChangeSequence,
    renderAll
}; 