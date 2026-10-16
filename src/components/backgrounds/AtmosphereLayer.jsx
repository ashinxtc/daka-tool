import { requestVisibleFrame as requestAnimationFrame, cancelVisibleFrame as cancelAnimationFrame, visibleAnimationNow } from '../../utils/visibleFrames.js';
import { backgroundDpr, createFrameGate } from '../../utils/graphicsQuality.js';
import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';

// --- 新增：银河星空 Canvas 特效 ---
        const GalaxyEffect = ({ isActive = true, isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const canvasRef = useRef(null);
            const animationRef = useRef(null);

            useEffect(() => {
                // 如果未激活，不启动动画
                if (!isActive) {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                        animationRef.current = null;
                    }
                    return;
                }

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                let width = window.innerWidth;
                let height = window.innerHeight;
                let stars = [];
                let animationFrameId;
                let lastDrawTime = 0;

                canvas.width = width;
                canvas.height = height;

                const initStars = () => {
                    stars = [];
                    const divisor = isLowPerf ? 5500 : isBalanced ? 1500 : 1000;
                    const starCount = Math.max(30, Math.floor((width * height) / divisor));
                    for (let i = 0; i < starCount; i++) {
                        stars.push({
                            x: Math.random() * width,
                            y: Math.random() * height,
                            radius: Math.random() * 1.5,
                            alpha: Math.random(),
                            speed: Math.random() * 0.05 + 0.05 // 极慢的漂浮感
                        });
                    }
                };

                const draw = (timestamp) => {
                    animationFrameId = requestAnimationFrame(draw);
                    if (isLowPerf && timestamp && timestamp - lastDrawTime < 33) {
                        return; // 低性能模式锁定 30 FPS，平稳节约设备算力
                    }
                    lastDrawTime = timestamp || 0;

                    ctx.clearRect(0, 0, width, height);
                    
                    // 绘制星空
                    stars.forEach(star => {
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                        ctx.fill();
                        
                        // 简单的闪烁和移动逻辑
                        star.alpha += (Math.random() - 0.5) * 0.02;
                        if (star.alpha < 0) star.alpha = 0;
                        if (star.alpha > 1) star.alpha = 1;
                        
                        star.y -= star.speed; // 缓慢向上漂浮
                        if (star.y < 0) star.y = height; // 循环
                    });
                };

                const handleResize = () => {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;
                    initStars();
                };

                initStars();
                animationFrameId = requestAnimationFrame(draw);

                window.addEventListener('resize', handleResize);
                return () => {
                    window.removeEventListener('resize', handleResize);
                    cancelAnimationFrame(animationFrameId);
                };
            }, [isActive, isLowPerf, isBalanced]);

            return (
                <div className="absolute inset-0 bg-galaxy-gradient transition-opacity duration-1000">
                    <canvas ref={canvasRef} className="absolute inset-0" />
                    {/* 叠加一层轻微的暗角，增加深邃感 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
                </div>
            );
        };

		// --- 新增：流星雨 CSS 特效组件 ---
        const MeteorShower = ({ isActive = true, isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const starCount = isLowPerf ? 22 : isBalanced ? 28 : 40;
            const meteorCount = isLowPerf ? 3 : isBalanced ? 4 : 6;

            // 生成静态的星星数据 (只生成一次)
            const stars = useMemo(() => Array.from({ length: starCount }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                top: Math.random() * 70 + '%', // 星星主要集中在中上部
                size: Math.random() * 2 + 1 + 'px',
                delay: Math.random() * 3 + 's',
                duration: Math.random() * 3 + 2 + 's'
            })), [starCount]);

            // 生成流星数据
            const meteors = useMemo(() => Array.from({ length: meteorCount }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                top: Math.random() * 30 + '%', // 流星从上方出现
                delay: Math.random() * 10 + 's', // 随机延迟，错开出现时间
                duration: Math.random() * 1.5 + 2 + 's' // 速度稍慢，更有宁静感
            })), [meteorCount]);

            return (
                <div className="absolute inset-0 bg-meteor-gradient overflow-hidden animate-in fade-in duration-1000">
                    {/* 1. 呼吸的星星 */}
                    {stars.map(s => (
                        <div key={s.id} className="absolute rounded-full bg-white" style={{
                            left: s.left, top: s.top, width: s.size, height: s.size,
                            animation: `star-twinkle ${s.duration} ease-in-out infinite ${s.delay}`
                        }} />
                    ))}
                    
                    {/* 2. 划过的流星 */}
                    {meteors.map(m => (
                        <div key={m.id} className="absolute h-[2px] w-[120px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-0" style={{
                            left: m.left, top: m.top,
                            boxShadow: '0 0 15px rgba(255,255,255,0.4)',
                            animation: `meteor-drop ${m.duration} linear infinite ${m.delay}`
                        }} />
                    ))}
                    
                    {/* 3. 底部微光遮罩 (让底部文字更清晰) */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0f172a] to-transparent opacity-80 pointer-events-none"></div>
                </div>
            );
        };

		// --- 新增：极地之夜·欧若拉 CSS 特效组件 ---
        // --- 新增：极地之夜·欧若拉特效 (1:1 还原 WebGL 版) ---
        const AURORA_VERT = `#version 300 es
			in vec2 position;
			void main() {
			  gl_Position = vec4(position, 0.0, 1.0);
			}
			`;

					const AURORA_FRAG = `#version 300 es
			precision highp float;
			uniform float uTime;
			uniform float uAmplitude;
			uniform vec3 uColorStops[3];
			uniform vec2 uResolution;
			uniform float uBlend;
			out vec4 fragColor;

			vec3 permute(vec3 x) {
			  return mod(((x * 34.0) + 1.0) * x, 289.0);
			}

			float snoise(vec2 v){
			  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
			  vec2 i  = floor(v + dot(v, C.yy));
			  vec2 x0 = v - i + dot(i, C.xx);
			  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
			  vec4 x12 = x0.xyxy + C.xxzz;
			  x12.xy -= i1;
			  i = mod(i, 289.0);
			  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
			  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
			  m = m * m; m = m * m;
			  vec3 x = 2.0 * fract(p * C.www) - 1.0;
			  vec3 h = abs(x) - 0.5;
			  vec3 ox = floor(x + 0.5);
			  vec3 a0 = x - ox;
			  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
			  vec3 g;
			  g.x  = a0.x  * x0.x  + h.x  * x0.y;
			  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
			  return 130.0 * dot(m, g);
			}

			struct ColorStop {
			  vec3 color;
			  float position;
			};

			// 使用单行宏防止 Babel 解析转义符失败
			#define COLOR_RAMP(colors, factor, finalColor) { int index = 0; for (int i = 0; i < 2; i++) { ColorStop currentColor = colors[i]; bool isInBetween = currentColor.position <= factor; index = int(mix(float(index), float(i), float(isInBetween))); } ColorStop currentColor = colors[index]; ColorStop nextColor = colors[index + 1]; float range = nextColor.position - currentColor.position; float lerpFactor = (factor - currentColor.position) / range; finalColor = mix(currentColor.color, nextColor.color, lerpFactor); }

			void main() {
			  vec2 uv = gl_FragCoord.xy / uResolution;

			  ColorStop colors[3];
			  colors[0] = ColorStop(uColorStops[0], 0.0);
			  colors[1] = ColorStop(uColorStops[1], 0.5);
			  colors[2] = ColorStop(uColorStops[2], 1.0);

			  vec3 rampColor;
			  COLOR_RAMP(colors, uv.x, rampColor);

			  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
			  height = exp(height);
			  height = (uv.y * 2.0 - height + 0.2);
			  float intensity = 0.6 * height;

			  float midPoint = 0.20;
			  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

			  vec3 auroraColor = intensity * rampColor;

			  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
			}
			`;

        const AuroraWebGL = (props) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, speed = 1.0, isLowPerf = false } = props;
            const propsRef = useRef({ colorStops, amplitude, blend, speed, isLowPerf });
            
            useEffect(() => {
                propsRef.current = { colorStops, amplitude, blend, speed, isLowPerf };
            }, [colorStops, amplitude, blend, speed, isLowPerf]);
            
            const ctnDom = useRef(null);

            useEffect(() => {
                const ctn = ctnDom.current;
                if (!ctn) return;

                // 创建原生 WebGL 画布
                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                canvas.style.backgroundColor = 'transparent';
                ctn.appendChild(canvas);

                // 采用 WebGL2 渲染上下文
                const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
                if (!gl) {
                    console.warn("设备不支持 WebGL2，极光特效无法渲染");
                    return;
                }

                // 编译着色器工具
                const compileShader = (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        console.error("Shader 编译失败:", gl.getShaderInfoLog(shader));
                        gl.deleteShader(shader);
                        return null;
                    }
                    return shader;
                };

                const vs = compileShader(gl.VERTEX_SHADER, AURORA_VERT);
                const fs = compileShader(gl.FRAGMENT_SHADER, AURORA_FRAG);
                const program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);

                const positionLoc = gl.getAttribLocation(program, 'position');
                const uTimeLoc = gl.getUniformLocation(program, 'uTime');
                const uAmplitudeLoc = gl.getUniformLocation(program, 'uAmplitude');
                const uBlendLoc = gl.getUniformLocation(program, 'uBlend');
                const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
                const uColorStopsLoc = gl.getUniformLocation(program, 'uColorStops');

                // 绘制覆盖全屏的大三角形
                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1,  3, -1,  -1, 3 ]), gl.STATIC_DRAW);

                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                gl.enableVertexAttribArray(positionLoc);
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                let animateId;
                let lastRenderTime = 0;
                const resize = () => {
                    // 使用视窗保底方案，防止初始化时 div 高度计算为 0 导致黑屏
                    const width = ctn.offsetWidth || window.innerWidth;
                    const height = ctn.offsetHeight || window.innerHeight;
                    // 低性能模式下以 0.35 DPR 渲染，极光本身具有柔和漫射特性，降采样不损失美感却直接消减 85% GPU 填充率
                    const dpr = backgroundDpr(window.devicePixelRatio, isLowPerf, isBalanced, 0.35);
                    canvas.width = Math.max(1, Math.round(width * dpr));
                    canvas.height = Math.max(1, Math.round(height * dpr));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                };
                window.addEventListener('resize', resize);
                resize();

                const hexToRgb = (hex) => {
                    let c = hex.replace(/^#/, '');
                    if (c.length === 3) c = c.split('').map(x => x + x).join('');
                    const num = parseInt(c, 16);
                    return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255];
                };

                let cachedColorsKey, cachedColors;
                const admitFrame = createFrameGate(isBalanced ? 30 : 0);
                const render = (t) => {
                    if (!admitFrame(t)) { animateId = requestAnimationFrame(render); return; }
                    animateId = requestAnimationFrame(render);
                    if (isLowPerf && t - lastRenderTime < 33) {
                        return; // 低性能模式限制 30 FPS 渲染
                    }
                    lastRenderTime = t;

                    const { speed, amplitude, blend, colorStops } = propsRef.current;
                    const time = t * 0.01;
                    
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    gl.useProgram(program);
                    gl.bindVertexArray(vao);

                    gl.uniform1f(uTimeLoc, time * speed * 0.1);
                    gl.uniform1f(uAmplitudeLoc, amplitude);
                    gl.uniform1f(uBlendLoc, blend);
                    gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

                    // 将颜色转为 9个浮点数的一维数组并强制传入，避开 OGL 源码内部解析 Bug
                    const colorsKey = colorStops.join('|');
                    if (colorsKey !== cachedColorsKey) {
                        cachedColorsKey = colorsKey;
                        cachedColors = new Float32Array(colorStops.flatMap(hexToRgb));
                    }
                    gl.uniform3fv(uColorStopsLoc, cachedColors);

                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                };

                animateId = requestAnimationFrame(render);

                return () => {
                    cancelAnimationFrame(animateId);
                    window.removeEventListener('resize', resize);
                    if (ctn.contains(canvas)) ctn.removeChild(canvas);
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                };
            }, [isLowPerf, isBalanced]);

            return <div ref={ctnDom} className="absolute inset-0 z-0 pointer-events-none" />;
        };

        const AuroraBorealis = ({ isActive = true, isLowPerf = false }) => {
            return (
                <div className="absolute inset-0 bg-aurora-base overflow-hidden animate-in fade-in duration-1000">
                    <AuroraWebGL 
                        colorStops={["#7cff67", "#B19EEF", "#5227FF"]} 
                        blend={0.5} 
                        amplitude={1.0} 
                        speed={1} 
                        isLowPerf={isLowPerf}
                    />
                    
                    {/* 保留你原本星空点缀，增强沉浸感，层级置于极光之上 */}
                    <div className="absolute inset-0 bg-black opacity-10 pointer-events-none z-10"></div>
                    <div className="absolute top-[20%] left-[15%] w-[3px] h-[3px] bg-white rounded-full opacity-90 animate-pulse z-10"></div>
                    <div className="absolute top-[35%] right-[25%] w-[4px] h-[4px] bg-white rounded-full opacity-70 animate-pulse z-10" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-[10%] left-[60%] w-[2px] h-[2px] bg-white rounded-full opacity-80 animate-pulse z-10" style={{animationDelay: '4s'}}></div>
                </div>
            );
        };

		// --- 新增：上元灯火·祈愿 CSS 特效组件 ---
        const LanternFestival = ({ isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            // 生成孔明灯数据（低性能模式下轻量化为 12 盏，确保老旧设备流畅运行）
            const count = isLowPerf ? 12 : isBalanced ? 24 : 35;
            const lanterns = useMemo(() => Array.from({ length: count }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                // 大小不一，模拟远近景深
                width: Math.random() * 15 + 10 + 'px', 
                // 速度极慢，营造庄重感
                duration: Math.random() * 15 + 20 + 's', 
                delay: Math.random() * 15 + 's',
                // 颜色微调：有的偏红，有的偏黄
                hue: Math.random() * 30 + 15 // Orange to Yellow
            })), [count]);

            return (
                <div className="absolute inset-0 bg-lantern-gradient overflow-hidden animate-in fade-in duration-1000">
                    {/* 氛围遮罩：底部暗，突出灯火亮度 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>

                    {/* 飘升的孔明灯 */}
                    {lanterns.map(l => (
                        <div key={l.id} 
                             className="absolute rounded-t-lg rounded-b-md opacity-90"
                             style={{
                                 left: l.left,
                                 width: l.width,
                                 height: `calc(${l.width} * 1.4)`, // 保持灯笼比例
                                 background: `linear-gradient(to top, hsl(${l.hue}, 90%, 50%), hsl(${l.hue}, 100%, 80%))`,
                                 animation: `lantern-float ${l.duration} linear infinite ${l.delay}, lantern-flicker 4s ease-in-out infinite alternate ${l.delay}`,
                                 bottom: '-50px' // 起始位置在屏幕下方
                             }}
                        >
                            {/* 内部灯芯微光 */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-white blur-[2px] rounded-full opacity-60"></div>
                        </div>
                    ))}

                    {/* 底部楼阁剪影 (CSS绘制简单起伏，增加层次感) */}
                    <div className="absolute bottom-0 w-full h-44 bg-black opacity-90 blur-[0.5px] z-10" 
                         style={{ 
                             /* 调整了多边形比例，让建筑看起来更修长，适应新的高度 */
                             clipPath: 'polygon(0% 100%, 0% 88%, 5% 80%, 10% 88%, 15% 75%, 25% 92%, 35% 70%, 45% 88%, 55% 65%, 65% 88%, 75% 60%, 85% 88%, 90% 75%, 95% 88%, 100% 80%, 100% 100%)',
                             background: 'linear-gradient(to top, #000 0%, #1a0505 100%)' 
                         }}>
                    </div>
                </div>
            );
        };
		
		// --- 终极复刻版：萤火之森 (原生效果) ---
        const FireflyForest = ({ isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            // 生成萤火虫数据（低性能模式下精简为 16 只，保证灵动微光的同时节省 CPU）
            const count = isLowPerf ? 16 : isBalanced ? 34 : 50;
            const fireflies = useMemo(() => Array.from({ length: count }).map((_, i) => ({
                id: i,
                // 随机延迟，打散运动和闪烁节奏
                moveDelay: Math.random() * -200 + 's',
                flashDelay: Math.random() * -10 + 's',
                driftDelay: Math.random() * -10 + 's'
            })), [count]);

            return (
                <div className="absolute inset-0 bg-night-forest animate-in fade-in duration-1000">
                    {/* 如果你有背景图，可以在这里加一个 img 标签，或者在 CSS .bg-night-forest 里设置 background-image */}
                    
                    <div className="firefly-container">
                        {fireflies.map(f => (
                            <div key={f.id} 
                                 className="firefly"
                                 style={{
                                     // 应用随机延迟，让每只萤火虫处于轨迹的不同位置
                                     animationDelay: f.moveDelay
                                 }}
                            >
                                {/* 通过伪元素控制发光，这里不需要内部 content，样式由 CSS 类控制 */}
                                <style dangerouslySetInnerHTML={{__html: `
                                    .firefly:nth-child(${f.id + 1})::before,
                                    .firefly:nth-child(${f.id + 1})::after {
                                        animation-delay: ${f.driftDelay}, ${f.flashDelay};
                                    }
                                `}} />
                            </div>
                        ))}
                    </div>

                    {/* 底部植被剪影 (保留，增加层次感) */}
                    <div className="absolute bottom-0 w-full h-48 opacity-60 pointer-events-none"
                         style={{
                             background: 'linear-gradient(to top, #000 0%, transparent 100%)',
                             maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                             WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)'
                         }}>
                         {/* 用简单的渐变模拟草丛根部 */}
                         <div className="absolute bottom-0 w-full h-full" 
                              style={{ 
                                  background: 'repeating-linear-gradient(90deg, transparent 0, transparent 2px, #000 3px, #000 6px)',
                                  filter: 'blur(1px)'
                              }}>
                         </div>
                    </div>
                </div>
            );
        };
		
		// --- 夫子庙前·银杏雨 CSS 特效组件 ---
        // --- 优化版：夫子庙前·银杏雨 CSS 特效组件 ---
        const GinkgoRain = ({ isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            // 生成银杏叶数据（低性能模式下精简为 16 片，保证飘落诗意的同时降低渲染负载）
            const count = isLowPerf ? 16 : isBalanced ? 34 : 50;
            const leaves = useMemo(() => Array.from({ length: count }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                size: Math.random() * 20 + 15 + 'px', // 15-35px 大小
                duration: Math.random() * 10 + 8 + 's', // 飘落速度稍快一点
                delay: Math.random() * 10 + 's',
                flipDuration: Math.random() * 4 + 2 + 's', // 翻滚速度
                // 【修改】颜色微调：加入一点点橙色，增加层次感
                color: Math.random() > 0.6 ? '#fbbf24' : (Math.random() > 0.5 ? '#f59e0b' : '#fcd34d') 
            })), [count]);

            return (
                <div className="absolute inset-0 bg-ginkgo-gradient overflow-hidden animate-in fade-in duration-1000">
                    {/* 氛围纹理：保留噪点质感 */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
                    </div>

                    {leaves.map(l => (
                        <div key={l.id} 
                             className="absolute"
                             style={{
                                 left: l.left,
                                 top: '-50px',
                                 width: l.size,
                                 height: l.size,
                                 animation: `ginkgo-fall ${l.duration} linear infinite ${l.delay}`
                             }}
                        >
                            <div className="w-full h-full"
                                 style={{
                                     animation: `ginkgo-flip ${l.flipDuration} ease-in-out infinite alternate`
                                 }}
                            >
                                <svg viewBox="0 0 1024 1024" fill={l.color} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))' }}>
                                    <path d="M512 832c0 0 128-256 256-256s192 64 192 64-64-256-192-320-256 0-256 0-128-64-256 0-192 320-192 320 64-64 192-64 256 256 256 256z M500 832l24 128-48 0 24-128z" />
                                </svg>
                            </div>
                        </div>
                    ))}

                    {/* 【修改】底部书院剪影：
                        - 高度 h-64 (256px)，显著加高
                        - 颜色加深，使用深褐渐变，与金色落叶形成强对比
                        - 轮廓优化，更像中国古建筑屋脊
                    */}
                    <div className="absolute bottom-0 w-full h-64 opacity-80 blur-[0.5px]" 
                         style={{ 
                             background: 'linear-gradient(to top, #451a03 0%, #78350f 100%)', // 深褐色系
                             clipPath: 'polygon(0% 100%, 0% 85%, 5% 90%, 15% 75%, 25% 90%, 35% 80%, 50% 95%, 65% 80%, 75% 90%, 85% 75%, 95% 90%, 100% 85%, 100% 100%)'
                         }}>
                    </div>
                </div>
            );
        };

		// --- 新增：传说·万象字阵 (The Matrix of Civilization) ---
        // --- 终极完美版：传说·万象字阵 (同步置换循环) ---
        const MatrixCivilization = ({ isActive = true, isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const canvasRef = useRef(null);
            const animationRef = useRef(null);

            // 预设字符集
            const ORACLE_CHARS = "之人刀少目土日云六左向白甲旦不止匕上鼻木月兵七又火乙昏步比大下舌禾星戈八南合丙正才保并小耳山米辰武九安豹册昌辰臭帝家雷旅娘明牛品".split("");

            useEffect(() => {
                // 如果未激活，不启动动画
                if (!isActive) {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                        animationRef.current = null;
                    }
                    return;
                }

                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');

                // --- 配置参数 ---
                const CONFIG = {
                    font: isLowPerf ? '34px "OracleBone", sans-serif' : '30px "OracleBone", sans-serif',
                    spacing: isLowPerf ? 72 : isBalanced ? 56 : 45,        // 低性能模式扩大网格间距，减少 60% 字符渲染，兼顾壮丽感与效能
                    color: '#FFD700',   // 金色
                    pauseTime: 60,      // 静止时长 (帧数, 约1秒)
                    moveTime: 90,       // 运动时长 (帧数, 约1.5秒)
                    trailAlpha: 0.15    // 拖尾透明度
                };

                let animationId;
                let shapes = [];
                let gridPoints = []; // 固定的网格坐标池
                let width = window.innerWidth;
                let height = window.innerHeight;
                
                // 动画状态控制
                let frameCount = 0; 
                const totalCycle = CONFIG.pauseTime + CONFIG.moveTime;

                // --- 缓动函数 (让运动起止更平滑) ---
                // EaseInOutCubic: 慢启动 -> 快中间 -> 慢结束
                const easeInOut = (t) => {
                    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                };

                // --- 形状类 ---
                class Shape {
                    constructor(i, x, y) {
                        this.index = i;
                        // 位置状态
                        this.x = x;       // 当前实时位置
                        this.y = y;
                        this.sx = x;      // Start X: 本次运动起飞点
                        this.sy = y;      // Start Y: 本次运动起飞点
                        this.tx = x;      // Target X: 本次运动目标点
                        this.ty = y;      // Target Y: 本次运动目标点
                        
                        this.char = ORACLE_CHARS[Math.floor(Math.random() * ORACLE_CHARS.length)];
                        
                        // 字体大小微调
                        const size = 20 + Math.random() * 8;
                        this.font = `${size}px "OracleBone"`;
                    }

                    // 设置新的目标
                    setTarget(targetX, targetY) {
                        this.sx = this.x; // 将当前位置设为起飞点
                        this.sy = this.y;
                        this.tx = targetX; // 设置新目标
                        this.ty = targetY;
                    }

                    // 根据进度更新位置 (0.0 ~ 1.0)
                    update(progress) {
                        // 如果进度为0，保持不动
                        if (progress <= 0) {
                            this.x = this.sx;
                            this.y = this.sy;
                            return;
                        }
                        // 如果进度完成，锁定在目标
                        if (progress >= 1) {
                            this.x = this.tx;
                            this.y = this.ty;
                            return;
                        }

                        // 插值计算
                        const easedProgress = easeInOut(progress);
                        this.x = this.sx + (this.tx - this.sx) * easedProgress;
                        this.y = this.sy + (this.ty - this.sy) * easedProgress;
                    }

                    draw(context) {
                        context.fillStyle = CONFIG.color;
                        context.font = this.font;
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(this.char, this.x, this.y);
                    }
                }

                // --- 初始化网格与字符 ---
                const init = () => {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;

                    shapes = [];
                    gridPoints = [];

                    const cols = Math.floor(width / CONFIG.spacing);
                    const rows = Math.floor(height / CONFIG.spacing);
                    
                    // 1. 生成标准的网格坐标系统
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            const x = (c * CONFIG.spacing) + (width - cols * CONFIG.spacing) / 2 + CONFIG.spacing/2;
                            const y = (r * CONFIG.spacing) + (height - rows * CONFIG.spacing) / 2 + CONFIG.spacing/2;
                            gridPoints.push({ x, y });
                        }
                    }

                    // 2. 初始化字符 (每个字符占据一个网格点)
                    gridPoints.forEach((p, i) => {
                        shapes.push(new Shape(i, p.x, p.y));
                    });
                };

                // --- 洗牌算法 (Fisher-Yates Shuffle) ---
                // 用于打乱网格坐标，分配给字符
                const shuffleGrid = () => {
                    // 克隆一份网格坐标
                    let shuffled = [...gridPoints];
                    
                    // 随机打乱
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    
                    // 将打乱后的坐标分配给字符作为新目标
                    shapes.forEach((shape, i) => {
                        if (shuffled[i]) {
                            shape.setTarget(shuffled[i].x, shuffled[i].y);
                        }
                    });
                };

                // --- 动画循环 ---
                let lastAnimateTime = 0;
                const animate = (timestamp) => {
                    animationId = requestAnimationFrame(animate);
                    if (isLowPerf && timestamp && timestamp - lastAnimateTime < 33) {
                        return; // 低性能模式限制 30 FPS 刷新率，稳定控制算力消耗
                    }
                    lastAnimateTime = timestamp || 0;

                    // 半透明背景，制造拖尾
                    ctx.fillStyle = `rgba(13, 13, 13, ${CONFIG.trailAlpha})`; 
                    ctx.fillRect(0, 0, width, height);

                    // 计算当前周期的进度
                    const cycleFrame = frameCount % totalCycle;

                    // --- 阶段 1: 准备起飞 (在静止期的最后一帧触发) ---
                    if (cycleFrame === CONFIG.pauseTime - 1) {
                        shuffleGrid(); // 全体重新分配目标
                    }

                    // --- 阶段 2: 运动中 ---
                    if (cycleFrame >= CONFIG.pauseTime) {
                        // 计算运动进度 (0.0 -> 1.0)
                        const rawProgress = (cycleFrame - CONFIG.pauseTime) / CONFIG.moveTime;
                        
                        shapes.forEach(shape => shape.update(rawProgress));
                    } 
                    // --- 阶段 3: 静止期 ---
                    else {
                        // 保持在当前位置不动 (实际上 update(0) 或 update(1) 都可以，这里不调用 update 节省性能，直接画)
                        // 但为了防止 resizing 导致的错位，我们让 shape 保持在它的目标位
                        // 这里不需要额外逻辑，因为 update(1) 已经在上一周期的末尾执行过了
                    }

                    // 绘制所有字符
                    shapes.forEach(shape => shape.draw(ctx));

                    frameCount++;
                };

                // --- 事件监听 ---
                const handleResize = () => {
                    init();
                    frameCount = 0; // 重置动画周期
                };
                window.addEventListener('resize', handleResize);

                // 启动
                init();
                animationId = requestAnimationFrame(animate);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    cancelAnimationFrame(animationId);
                };
            }, [isActive, isLowPerf, isBalanced]);

            return (
                <div className="absolute inset-0 bg-matrix-civilization animate-in fade-in duration-1000">
                    <canvas ref={canvasRef} className="block w-full h-full" />
                    {/* 氛围遮罩 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
                </div>
            );
        };
		
		// --- 新增：终极视觉版：【秘境·甲骨流沙】 (Oracle Sands)(点金成石特效) ---
        const MatrixOracleSands = ({ isActive = true, isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const canvasRef = useRef(null);
            const animationRef = useRef(null);

            // 预设字符集
            const ORACLE_CHARS = "之人刀少目土日云六左向白甲旦不止匕上鼻木月兵七又火乙昏步比大下舌禾星戈八南合丙正才保并小耳山米辰武九安豹册昌辰臭帝家雷旅娘明牛品".split("");

            useEffect(() => {
                // 如果未激活，不启动动画
                if (!isActive) {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                        animationRef.current = null;
                    }
                    return;
                }

                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');

                // --- 配置参数 ---
                const CONFIG = {
                    font: isLowPerf ? '34px "OracleBone", sans-serif' : '30px "OracleBone", sans-serif',
                    scale: 1,
                    spacing: isLowPerf ? 68 : isBalanced ? 50 : 40, // 低性能模式以更舒缓的间距排布字符，节约 65% 计算负载，1:1 保留点金成石互动
                    // 颜色配置
                    baseColor: '#8c7853',   // 初始颜色：生锈的青铜 (暗淡但可见)
                    activeColor: '#ffdd00', // 激活颜色：耀眼的赤金 (高亮)
                    mouseRadius: 150        // 鼠标影响范围
                };

                let animationId;
                let shapes = [];
                let width = window.innerWidth;
                let height = window.innerHeight;

                const mouse = { x: width / 2, y: height / 2 };

                // --- 辅助函数：颜色插值 (Lerp) ---
                // 将 hex 颜色转换为 rgb 并混合
                const hexToRgb = (hex) => {
                    const bigint = parseInt(hex.slice(1), 16);
                    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
                };

                const baseRgb = hexToRgb(CONFIG.baseColor);
                const activeRgb = hexToRgb(CONFIG.activeColor);

                const getBlendedColor = (energy) => {
                    // energy: 0.0 ~ 1.0
                    const r = Math.round(baseRgb[0] + (activeRgb[0] - baseRgb[0]) * energy);
                    const g = Math.round(baseRgb[1] + (activeRgb[1] - baseRgb[1]) * energy);
                    const b = Math.round(baseRgb[2] + (activeRgb[2] - baseRgb[2]) * energy);
                    return `rgb(${r}, ${g}, ${b})`;
                };

                // --- 形状类 ---
                class Shape {
                    constructor(x, y, i) {
                        this.x = Math.random() * width; // 随机出生
                        this.y = Math.random() * height;
                        this.tx = x; // 目标位置
                        this.ty = y;
                        this.index = i;
                        this.char = ORACLE_CHARS[Math.floor(Math.random() * ORACLE_CHARS.length)];

                        const size = 20 + Math.random() * 20;
                        this.font = `${size}px "OracleBone"`;

                        // 能量值：0 = 青铜，1 = 赤金
                        this.energy = 0;
                    }

                    update() {
                        // 1. 飞入逻辑 (缓动追逐)
                        const dx = this.tx - this.x;
                        const dy = this.ty - this.y;
                        this.x += dx * 0.05;
                        this.y += dy * 0.05;

                        // 2. 鼠标交互 + 能量注入
                        const mouseDx = mouse.x - this.x;
                        const mouseDy = mouse.y - this.y;
                        const dist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                        if (dist < CONFIG.mouseRadius) {
                            const angle = Math.atan2(mouseDy, mouseDx);
                            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                            const push = force * 20;

                            this.x -= Math.cos(angle) * push;
                            this.y -= Math.sin(angle) * push;

                            // 【关键】被推开瞬间，能量瞬间拉满
                            // force 越大（离鼠标越近），能量越强
                            this.energy = Math.max(this.energy, force);
                        }

                        // 3. 能量自然衰减 (模拟冷却)
                        // 每一帧衰减 5%，让颜色慢慢变回青铜
                        this.energy *= 0.95;
                        if (this.energy < 0.01) this.energy = 0;
                    }

                    draw(context) {
                        // 根据当前能量值计算颜色
                        context.fillStyle = getBlendedColor(this.energy);

                        // 如果能量很高，额外加一个发光效果（低性能模式略过阴影模糊）
                        if (!isLowPerf && this.energy > 0.5) {
                            context.shadowBlur = 10 * this.energy;
                            context.shadowColor = CONFIG.activeColor;
                        } else {
                            context.shadowBlur = 0;
                        }

                        context.font = this.font;
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(this.char, this.x, this.y);
                    }
                }

                // --- 初始化与循环 ---
                const init = () => {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;

                    shapes = [];
                    const cols = Math.floor(width / CONFIG.spacing);
                    const rows = Math.floor(height / CONFIG.spacing);

                    let index = 0;
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            const x = (c * CONFIG.spacing) + (width - cols * CONFIG.spacing) / 2;
                            const y = (r * CONFIG.spacing) + (height - rows * CONFIG.spacing) / 2;
                            shapes.push(new Shape(x, y, index++));
                        }
                    }
                };

                let lastAnimateTime = 0;
                const animate = (timestamp) => {
                    animationId = requestAnimationFrame(animate);
                    animationRef.current = animationId;
                    if (isLowPerf && timestamp && timestamp - lastAnimateTime < 33) {
                        return; // 低性能模式限制 30 FPS 刷新
                    }
                    lastAnimateTime = timestamp || 0;

                    // 半透明拖尾
                    ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
                    ctx.fillRect(0, 0, width, height);

                    shapes.forEach(shape => {
                        shape.update();
                        shape.draw(ctx);
                    });
                };

                const handleResize = () => init();
                const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
                const handleTouchMove = (e) => { if(e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } };

                window.addEventListener('resize', handleResize);
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('touchmove', handleTouchMove);

                init();
                animationId = requestAnimationFrame(animate);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('touchmove', handleTouchMove);
                    if (animationId) cancelAnimationFrame(animationId);
                };
            }, [isActive, isLowPerf, isBalanced]);

            return (
                <div className="absolute inset-0 bg-matrix-civilization animate-in fade-in duration-1000">
                    <canvas ref={canvasRef} className="block w-full h-full" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
                </div>
            );
        };
		
		// --- 终极特效版：新春限定·火树银花 (直飞+螺旋尾+金粉特效) ---
        const LunarFireworks = ({ isActive = true, isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const canvasRef = useRef(null);
            const animationRef = useRef(null);

            useEffect(() => {
                // 如果未激活，不启动动画
                if (!isActive) {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                        animationRef.current = null;
                    }
                    return;
                }

                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                let width = canvas.width = window.innerWidth;
                let height = canvas.height = window.innerHeight;

                // 2. 核心物理引擎
                const objects = [];
                const COLOR = {
                    Red: '#ff0043', Green: '#14fc56', Blue: '#1e7fff', Purple: '#e60aff',
                    Gold: '#ffbf36', White: '#ffffff'
                };
                
                const MyMath = {
                    toRad: (deg) => deg * Math.PI / 180,
                    pointDist: (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
                    random: (min, max) => Math.random() * (max - min) + min,
                    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)]
                };

                /// [Shell]: 升空烟花 (直飞带物理抖动 + 真实金粉尾焰)
                class Shell {
                    constructor(options) {
                        Object.assign(this, options);
                        this.speed = options.speed || 12; // 初始速度
                        this.y = height; // 强制从底部生成
                        this.x = options.x; 
                        this.baseX = options.x; // 记录基础X，用于计算抖动基准
                        this.targetY = options.targetY;
                        
                        this.color = options.color || COLOR.Gold;
                        this.size = 3;
                    }

                    update() {
                        const dist = this.y - this.targetY;
                        this.y -= this.speed * (dist / (height - this.targetY) + 0.1);
                        
                        // 1. 本体微弱抖动：模拟火药推进时的不稳定燃烧，使其不那么呆板
                        // 让 x 坐标在 baseX 左右 2px 范围内随机漂移
                        this.x = this.baseX + (Math.random() - 0.5) * 4; 

                        // 2. 金粉尾焰：模拟推进剂掉落的火花碎屑
                        // 低性能模式下每帧只生成 1 粒尾焰碎屑，节约 60% 对象池开销
                        const sparkCount = isLowPerf ? 1 : (Math.floor(Math.random() * 3) + 1);
                        for (let i = 0; i < sparkCount; i++) {
                            objects.push(new Spark({
                                x: this.x + (Math.random() - 0.5) * 4, // 在弹头周围随机散开
                                y: this.y,
                                // 尾焰颜色：大部分是金色，偶尔夹杂烟花本色或极高亮的白色
                                color: Math.random() > 0.7 ? this.color : (Math.random() > 0.5 ? COLOR.White : COLOR.Gold),
                                size: MyMath.random(0.5, 2), // 碎屑大小不一
                                life: MyMath.random(20, 45), // 存在时间较短，形成彗星尾巴的锥形效果
                                speed: MyMath.random(1, 3.5), // 喷射初速度
                                // 角度设定：Math.PI / 2 是正下方，加上随机微调形成扇形喷射
                                angle: Math.PI / 2 + (Math.random() - 0.5) * 0.8, 
                                grav: 0.05,
                                drag: 0.94
                            }));
                        }

                        // 到达目标判断
                        if (this.y <= this.targetY + 10) return true; 
                        return false;
                    }

                    draw(ctx) {
                        // 绘制弹头高光中心 (白热化)
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 0.8, 0, 2 * Math.PI);
                        ctx.fillStyle = '#FFF'; 
                        ctx.fill();
                        
                        // 绘制弹头边缘泛光 (体现烟花颜色)
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size * 2.5, 0, 2 * Math.PI);
                        ctx.fillStyle = this.color;
                        ctx.globalAlpha = 0.4;
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }

                // [Star]: 爆炸主粒子 (修改为金粉散落逻辑)
                class Star {
                    constructor(options) {
                        Object.assign(this, options);
                        this.life = options.life || 100;
                        this.maxLife = this.life;
                        
                        this.vx = Math.cos(options.angle) * options.speed;
                        this.vy = Math.sin(options.angle) * options.speed;
                        
                        // 【修改】允许外部传入重力和阻力，实现不同烟花形态
                        this.grav = options.grav !== undefined ? options.grav : 0.05; 
                        this.drag = options.drag !== undefined ? options.drag : 0.96; 
                    }

                    update() {
                        this.vx *= this.drag;
                        this.vy *= this.drag;
                        this.vy += this.grav;
                        this.x += this.vx;
                        this.y += this.vy;
                        this.life--;

                        // --- 金粉特效核心逻辑 ---
                        // 在飞行过程中，随机掉落细小的金色火花 (Spark)
                        // 概率随速度降低而降低
                        if (Math.random() < 0.3 && this.life > 10) {
                            objects.push(new Spark({
                                x: this.x,
                                y: this.y,
                                color: this.color, // 继承主粒子颜色，或者固定为金色 '#ffbf36'
                                size: MyMath.random(0.5, 1.2),
                                life: MyMath.random(10, 30), // 消失得很快
                                speed: 0, // 原地停留，产生拖尾感
                                angle: 0
                            }));
                        }

                        return this.life <= 0;
                    }

                    draw(ctx) {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                        ctx.fillStyle = this.color;
                        // 闪烁效果
                        const blink = Math.random() * 0.5 + 0.5;
                        ctx.globalAlpha = (this.life / this.maxLife) * blink;
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }

                // [Spark]: 细小的火花/金粉 (用于尾迹和金粉散落)
                class Spark {
                    constructor(options) {
                        Object.assign(this, options);
                        this.vx = Math.cos(options.angle) * options.speed;
                        this.vy = Math.sin(options.angle) * options.speed;
                        this.grav = 0.02; // 很轻
                        this.drag = 0.9;  // 阻力大，很快停下
                        this.maxLife = this.life;
                    }

                    update() {
                        this.vx *= this.drag;
                        this.vy *= this.drag;
                        this.vy += this.grav;
                        this.x += this.vx;
                        this.y += this.vy;
                        this.life--;
                        return this.life <= 0;
                    }

                    draw(ctx) {
                        ctx.fillStyle = this.color;
                        ctx.globalAlpha = (this.life / this.maxLife);
                        // 绘制成小方块比圆形性能好，且有“粉末”感
                        ctx.fillRect(this.x, this.y, this.size, this.size);
                        ctx.globalAlpha = 1;
                    }
                }

                // [Burst]: 爆炸管理器 (新增多种高级形态)
                class Burst {
                    constructor(options) {
                        this.x = options.x;
                        this.y = options.y;
                        const color = options.color || MyMath.randomChoice(Object.values(COLOR));
                        
                        // 随机选择烟花类型：0=经典球形, 1=金色垂柳, 2=双层带蕊牡丹
                        const type = Math.floor(Math.random() * 3);

                        if (type === 0) {
                            // 形态 1：经典球形（密集、速度不均、带金粉拖尾）
                            const count = isLowPerf ? 38 : isBalanced ? 80 : 120; // 低性能模式适度减少爆炸粒子数，保持 1:1 绚丽造型
                            for (let i = 0; i < count; i++) {
                                const angle = MyMath.random(0, 2 * Math.PI);
                                const speed = Math.pow(Math.random(), 0.5) * 8.5; 
                                objects.push(new Star({
                                    x: this.x, y: this.y, color: color, angle: angle, speed: speed,
                                    size: MyMath.random(1.5, 3), life: MyMath.random(80, 150)
                                }));
                            }
                        } else if (type === 1) {
                            // 形态 2：金色垂柳（重力大、寿命长、像瀑布一样坠落）
                            const count = isLowPerf ? 28 : isBalanced ? 60 : 90;
                            for (let i = 0; i < count; i++) {
                                const angle = MyMath.random(0, 2 * Math.PI);
                                const speed = Math.pow(Math.random(), 0.5) * 5; // 初速度慢
                                objects.push(new Star({
                                    x: this.x, y: this.y, color: COLOR.Gold, angle: angle, speed: speed,
                                    size: MyMath.random(2, 3), life: MyMath.random(120, 220),
                                    grav: 0.08, drag: 0.97 // 重力增加，阻力减小(飘得远)
                                }));
                            }
                        } else if (type === 2) {
                            // 形态 3：双层带蕊牡丹（真实感极强的双色叠加，带有自然扰动）
                            const outerCount = isLowPerf ? 28 : isBalanced ? 60 : 90;
                            // 1. 外层花瓣（速度设定随机区间，打破绝对圆形的规整感）
                            for (let i = 0; i < outerCount; i++) {
                                const angle = MyMath.random(0, 2 * Math.PI);
                                const speed = MyMath.random(5, 9); // 速度参差不齐，边缘自然散开
                                objects.push(new Star({
                                    x: this.x, y: this.y, color: color, angle: angle, speed: speed,
                                    size: MyMath.random(1.5, 2.5), life: MyMath.random(80, 140),
                                    grav: 0.05, drag: 0.96 
                                }));
                            }
                            
                            // 2. 内层花蕊（致密、速度慢。如果外层是金色/白色，内蕊就用红色反衬，否则用金色）
                            const innerCount = isLowPerf ? 14 : isBalanced ? 28 : 40;
                            const innerColor = (color === COLOR.Gold || color === COLOR.White) ? COLOR.Red : COLOR.Gold;
                            for (let i = 0; i < innerCount; i++) {
                                const angle = MyMath.random(0, 2 * Math.PI);
                                const speed = MyMath.random(1.5, 3.5); // 爆炸力小，聚集在中心
                                objects.push(new Star({
                                    x: this.x, y: this.y, color: innerColor, angle: angle, speed: speed,
                                    size: MyMath.random(1.5, 2), life: MyMath.random(60, 100),
                                    grav: 0.05, drag: 0.94 
                                }));
                            }
                        }
                    }
                    update() { return true; } 
                    draw() {}
                }

                // 3. 动画循环
                let autoLaunchTimer = 0;
                let autoLaunchInterval = 1000;
                let animationId;

                // 立即发射两枚迎新春烟花，营造热闹氛围
                objects.push(new Shell({
                    x: width * 0.35,
                    targetY: height * 0.28,
                    color: COLOR.Gold,
                    speed: 14
                }));
                objects.push(new Shell({
                    x: width * 0.65,
                    targetY: height * 0.22,
                    color: COLOR.Red,
                    speed: 15
                }));

				// 生成背景繁星
                const bgStars = Array.from({ length: isLowPerf ? 45 : isBalanced ? 100 : 150 }, () => ({
                    xRatio: Math.random(), // 存储 0~1 的宽度比例
                    yRatio: Math.random() * 0.85, // 存储 0~0.85 的高度比例
                    size: Math.random() * 1.2 + 0.2,
                    alpha: Math.random(),
                    speed: Math.random() * 0.015 + 0.005,
                    dir: Math.random() > 0.5 ? 1 : -1
                }));

                let lastLoopTime = 0;
                const loop = (timestamp) => {
                    animationId = requestAnimationFrame(loop);
                    if (isLowPerf && timestamp && timestamp - lastLoopTime < 33) {
                        return; // 低性能模式限制 30 FPS 刷新
                    }
                    lastLoopTime = timestamp || 0;

                    // 1. 拖尾效果：必须用 destination-out (橡皮擦模式)
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; // 0.25 控制拖尾长度
                    ctx.fillRect(0, 0, width, height);

                    // 绘制呼吸闪烁的繁星背景
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = '#FFF';
                    bgStars.forEach(star => {
                        // 呼吸闪烁逻辑
                        star.alpha += star.speed * star.dir;
                        if (star.alpha > 0.7) { star.alpha = 0.7; star.dir = -1; }
                        if (star.alpha < 0.1) { star.alpha = 0.1; star.dir = 1; }
                        
                        ctx.globalAlpha = star.alpha;
                        ctx.beginPath();
                        ctx.arc(star.xRatio * width, star.yRatio * height, star.size, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1; // 恢复默认透明度

                    // 2. 画烟花：必须切回 lighter 叠加发光模式
                    ctx.globalCompositeOperation = 'lighter';

                    // 自动发射
                    autoLaunchTimer += 16; 
                    if (autoLaunchTimer > autoLaunchInterval) {
                        const targetX = MyMath.random(width * 0.05, width * 0.95);
                        const targetY = MyMath.random(height * 0.1, height * 0.65);
                        
                        objects.push(new Shell({
                            x: targetX, // 直飞：起点X = 终点X
                            targetY: targetY,
                            color: MyMath.randomChoice(Object.values(COLOR))
                        }));
                        
                        autoLaunchTimer = 0;
                        autoLaunchInterval = isLowPerf ? MyMath.random(2200, 3800) : MyMath.random(1200, 2500);
                    }

                    // 更新所有对象
                    for (let i = objects.length - 1; i >= 0; i--) {
                        const obj = objects[i];
                        if (obj.update()) {
                            // 如果是 Shell 完成任务，变为 Burst
                            if (obj instanceof Shell) {
                                new Burst({ x: obj.x, y: obj.y, color: obj.color });
                            }
                            // 移除已完成的对象 (Shell 或 寿命耗尽的粒子)
                            objects.splice(i, 1);
                        } else {
                            obj.draw(ctx);
                        }
                    }
                };

                // 4. 交互处理 (点击屏幕空白处，发射烟花直飞到目标位置)
                const handleInteraction = (e) => {
                    // 如果点击在按钮、输入框、弹窗等交互元素上，不发射烟花，避免干扰操作
                    if (e.target && e.target.closest && e.target.closest('button, input, select, textarea, a, [role="button"], .interactive, .cursor-pointer, [data-interactive="true"]')) {
                        return;
                    }
                    if (e.target && e.target.closest && e.target.closest('.fixed.inset-0:not(.atmosphere-layer)')) {
                        return;
                    }
                    let clientX, clientY;
                    if (e.touches && e.touches.length > 0) {
                        clientX = e.touches[0].clientX;
                        clientY = e.touches[0].clientY;
                    } else {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    }
                    if (clientX === undefined || clientY === undefined) return;

                    objects.push(new Shell({
                        x: clientX, // 直飞到点击处
                        targetY: clientY,
                        color: MyMath.randomChoice(Object.values(COLOR)),
                        speed: 15 // 点击发射的稍微快一点
                    }));
                };

                const handleResize = () => {
                    if (!canvas) return;
                    width = canvas.width = window.innerWidth;
                    height = canvas.height = window.innerHeight;
                };

                window.addEventListener('resize', handleResize);
                window.addEventListener('pointerdown', handleInteraction);

                animationId = requestAnimationFrame(loop);

                return () => {
                    if (animationId) cancelAnimationFrame(animationId);
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('pointerdown', handleInteraction);
                };
            }, [isActive, isLowPerf, isBalanced]);

            return (
                <div 
                    className="absolute inset-0 w-full h-full bg-lunar-night overflow-hidden animate-in fade-in duration-1000 pointer-events-none"
                >
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                </div>
            );
        };
		
		// --- 新增：登科·琉璃华光特效 (Prismatic Burst 纯原生WebGL无依赖版) ---
        const PRISMATIC_VERT = `#version 300 es
			in vec2 position;
			void main() {
				gl_Position = vec4(position, 0.0, 1.0);
			}
			`;

					const PRISMATIC_FRAG = `#version 300 es
			precision highp float;
			precision highp int;
			out vec4 fragColor;

			uniform vec2  uResolution;
			uniform float uTime;
			uniform float uIntensity;
			uniform float uSpeed;
			uniform int   uAnimType;
			uniform vec2  uMouse;
			uniform int   uColorCount;
			uniform float uDistort;
			uniform vec2  uOffset;
			uniform sampler2D uGradient;
			uniform float uNoiseAmount;
			uniform int   uRayCount;

			float hash21(vec2 p){
				p = floor(p);
				float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
				return fract(f);
			}

			mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

			float layeredNoise(vec2 fragPx){
				vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
				vec2 q = rot30() * p;
				float n = 0.0;
				n += 0.40 * hash21(q);
				n += 0.25 * hash21(q * 2.0 + 17.0);
				n += 0.20 * hash21(q * 4.0 + 47.0);
				n += 0.10 * hash21(q * 8.0 + 113.0);
				n += 0.05 * hash21(q * 16.0 + 191.0);
				return n;
			}

			vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
				float focal = res.y * max(dist, 1e-3);
				return normalize(vec3(2.0 * (frag - offset) - res, focal));
			}

			float edgeFade(vec2 frag, vec2 res, vec2 offset){
				vec2 toC = frag - 0.5 * res - offset;
				float r = length(toC) / (0.5 * min(res.x, res.y));
				float x = clamp(r, 0.0, 1.0);
				float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
				float s = q * 0.5;
				s = pow(s, 1.5);
				float tail = 1.0 - pow(1.0 - s, 2.0);
				s = mix(s, tail, 0.2);
				float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
				return clamp(s + dn, 0.0, 1.0);
			}

			mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
			mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
			mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

			vec3 sampleGradient(float t){
				t = clamp(t, 0.0, 1.0);
				return texture(uGradient, vec2(t, 0.5)).rgb;
			}

			vec2 rot2(vec2 v, float a){
				float s = sin(a), c = cos(a);
				return mat2(c, -s, s, c) * v;
			}

			float bendAngle(vec3 q, float t){
				float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
						+ 0.7 * sin(q.y * 0.50 - t * 0.5)
						+ 0.6 * sin(q.z * 0.60 + t * 0.7);
				return a;
			}

			void main(){
				vec2 frag = gl_FragCoord.xy;
				float t = uTime * uSpeed;
				float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
				vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
				float marchT = 0.0;
				vec3 col = vec3(0.0);
				float n = layeredNoise(frag);
				vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
				mat2 M2 = mat2(c.x, c.y, c.z, c.w);
				float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
				mat3 rot3dMat = mat3(1.0);
				
				if(uAnimType == 1){
					vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
					rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
				}
				
				mat3 hoverMat = mat3(1.0);
				if(uAnimType == 2){
					vec2 m = uMouse * 2.0 - 1.0;
					vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
					hoverMat = rotY(ang.y) * rotX(ang.x);
				}
				
				for (int i = 0; i < 44; ++i) {
					vec3 P = marchT * dir;
					P.z -= 2.0;
					float rad = length(P);
					vec3 Pl = P * (10.0 / max(rad, 1e-6));
					
					if(uAnimType == 0){
						Pl.xz *= M2;
					} else if(uAnimType == 1){
						Pl = rot3dMat * Pl;
					} else {
						Pl = hoverMat * Pl;
					}
					
					float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;
					float grow = smoothstep(0.35, 3.0, marchT);
					float a1 = amp * grow * bendAngle(Pl * 0.6, t);
					float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
					vec3 Pb = Pl;
					Pb.xz = rot2(Pb.xz, a1);
					Pb.xy = rot2(Pb.xy, a2);
					
					float rayPattern = smoothstep(
						0.5, 0.7,
						sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
						sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
					);
					
					if (uRayCount > 0) {
						float ang = atan(Pb.y, Pb.x);
						float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
						comb = pow(comb, 3.0);
						rayPattern *= smoothstep(0.15, 0.95, comb);
					}
					
					vec3 spectralDefault = 1.0 + vec3(
						cos(marchT * 3.0 + 0.0),
						cos(marchT * 3.0 + 1.0),
						cos(marchT * 3.0 + 2.0)
					);
					
					float saw = fract(marchT * 0.25);
					float tRay = saw * saw * (3.0 - 2.0 * saw);
					vec3 userGradient = 2.0 * sampleGradient(tRay);
					vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
					vec3 base = (0.05 / (0.4 + stepLen))
							  * smoothstep(5.0, 0.0, rad)
							  * spectral;
					col += base * rayPattern;
					marchT += stepLen;
				}
				col *= edgeFade(frag, uResolution, uOffset);
				col *= uIntensity;
				fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
			}
			`;

        const PrismaticBurstWebGL = (props) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const { 
                intensity = 2, 
                speed = 0.5, 
                animationType = 'rotate3d', 
                colors = ['#ff007a', '#4d3dff', '#ffffff'], 
                distort = 0, 
                offset = { x: 0, y: 0 }, 
                hoverDampness = 0.25, 
                rayCount = 0,
                isLowPerf = false
            } = props;
            
            const propsRef = useRef({ intensity, speed, animationType, colors, distort, offset, hoverDampness, rayCount });
            
            useEffect(() => {
                propsRef.current = { intensity, speed, animationType, colors, distort, offset, hoverDampness, rayCount };
            }, [intensity, speed, animationType, colors, distort, offset, hoverDampness, rayCount]);

            const ctnDom = useRef(null);

            useEffect(() => {
                const ctn = ctnDom.current;
                if (!ctn) return;

                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                canvas.style.backgroundColor = 'transparent';
                // 启用原代码中的 lighten 光效叠加滤镜
                canvas.style.mixBlendMode = 'lighten'; 
                ctn.appendChild(canvas);

                const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
                if (!gl) {
                    console.warn("设备不支持 WebGL2，琉璃华光特效无法渲染");
                    return;
                }

                const compileShader = (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
                    return shader;
                };

                const vs = compileShader(gl.VERTEX_SHADER, PRISMATIC_VERT);
                const fs = compileShader(gl.FRAGMENT_SHADER, PRISMATIC_FRAG);
                const program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);

                const locs = {
                    position: gl.getAttribLocation(program, 'position'),
                    uResolution: gl.getUniformLocation(program, 'uResolution'),
                    uTime: gl.getUniformLocation(program, 'uTime'),
                    uIntensity: gl.getUniformLocation(program, 'uIntensity'),
                    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
                    uAnimType: gl.getUniformLocation(program, 'uAnimType'),
                    uMouse: gl.getUniformLocation(program, 'uMouse'),
                    uColorCount: gl.getUniformLocation(program, 'uColorCount'),
                    uDistort: gl.getUniformLocation(program, 'uDistort'),
                    uOffset: gl.getUniformLocation(program, 'uOffset'),
                    uGradient: gl.getUniformLocation(program, 'uGradient'),
                    uNoiseAmount: gl.getUniformLocation(program, 'uNoiseAmount'),
                    uRayCount: gl.getUniformLocation(program, 'uRayCount')
                };

                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1,  3, -1,  -1, 3 ]), gl.STATIC_DRAW);

                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                gl.enableVertexAttribArray(locs.position);
                gl.vertexAttribPointer(locs.position, 2, gl.FLOAT, false, 0, 0);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                // 生成用于着色器采样的 1D 颜色过渡渐变纹理
                const gradientTex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, gradientTex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                const hexToRgb01 = hex => {
                    let h = hex.trim().replace(/^#/, '');
                    if (h.length === 3) h = h.split('').map(x=>x+x).join('');
                    const intVal = parseInt(h, 16);
                    return [((intVal >> 16) & 255)/255, ((intVal >> 8) & 255)/255, (intVal & 255)/255];
                };

                const updateTexture = (cols) => {
                    if (!cols || cols.length === 0) return 0;
                    const count = Math.min(cols.length, 64);
                    const data = new Uint8Array(count * 4);
                    for(let i=0; i<count; i++){
                        const [r,g,b] = hexToRgb01(cols[i]);
                        data[i*4+0] = Math.round(r*255);
                        data[i*4+1] = Math.round(g*255);
                        data[i*4+2] = Math.round(b*255);
                        data[i*4+3] = 255;
                    }
                    gl.bindTexture(gl.TEXTURE_2D, gradientTex);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, count, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
                    return count;
                };

                let animateId;
                let lastTime = visibleAnimationNow();
                let accumTime = 0;
                const mouseSmooth = [0.5, 0.5];
                const mouseTarget = [0.5, 0.5];

                const resize = () => {
                    const width = ctn.offsetWidth || window.innerWidth;
                    const height = ctn.offsetHeight || window.innerHeight;
                    // 低性能模式下以 0.35 DPR 渲染，消减 85% 填充率，依靠 GPU 双线性插值保持梦幻流光光感
                    const dpr = backgroundDpr(window.devicePixelRatio, isLowPerf, isBalanced, 0.35);
                    canvas.width = Math.max(1, Math.round(width * dpr));
                    canvas.height = Math.max(1, Math.round(height * dpr));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                };
                window.addEventListener('resize', resize);
                resize();

                const onPointerMove = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
                    const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
                    mouseTarget[0] = Math.min(Math.max(x, 0), 1);
                    mouseTarget[1] = Math.min(Math.max(y, 0), 1);
                };
                window.addEventListener('pointermove', onPointerMove);

                const admitFrame = createFrameGate(isBalanced ? 30 : 0);
                const render = (now) => {
                    if (!admitFrame(now)) { animateId = requestAnimationFrame(render); return; }
                    if (isLowPerf && now - lastTime < 33) {
                        animateId = requestAnimationFrame(render);
                        return; // 低性能模式限制 30 FPS 刷新率
                    }
                    const dt = Math.max(0, now - lastTime) * 0.001;
                    lastTime = now;
                    accumTime += dt;

                    const p = propsRef.current;
                    const tau = 0.02 + Math.max(0, Math.min(1, p.hoverDampness || 0.25)) * 0.5;
                    const alpha = 1 - Math.exp(-dt / tau);
                    mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
                    mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;

                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.useProgram(program);
                    gl.bindVertexArray(vao);

                    gl.uniform2f(locs.uResolution, canvas.width, canvas.height);
                    gl.uniform1f(locs.uTime, accumTime);
                    gl.uniform1f(locs.uIntensity, p.intensity ?? 2);
                    gl.uniform1f(locs.uSpeed, p.speed ?? 0.5);
                    
                    const animTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };
                    gl.uniform1i(locs.uAnimType, animTypeMap[p.animationType ?? 'rotate3d'] ?? 1);
                    gl.uniform2f(locs.uMouse, mouseSmooth[0], mouseSmooth[1]);
                    
                    const colorCount = updateTexture(p.colors);
                    gl.uniform1i(locs.uColorCount, colorCount);
                    gl.uniform1f(locs.uDistort, p.distort ?? 0);
                    
                    const ox = parseFloat(p.offset?.x) || 0;
                    const oy = parseFloat(p.offset?.y) || 0;
                    gl.uniform2f(locs.uOffset, ox, oy);
                    
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, gradientTex);
                    gl.uniform1i(locs.uGradient, 0);

                    gl.uniform1f(locs.uNoiseAmount, 0.8);
                    gl.uniform1i(locs.uRayCount, p.rayCount ?? 0);

                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    animateId = requestAnimationFrame(render);
                };
                animateId = requestAnimationFrame(render);

                return () => {
                    cancelAnimationFrame(animateId);
                    window.removeEventListener('resize', resize);
                    window.removeEventListener('pointermove', onPointerMove);
                    if (ctn.contains(canvas)) ctn.removeChild(canvas);
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                };
            }, [isLowPerf, isBalanced]);

            return <div ref={ctnDom} className="absolute inset-0 z-0 pointer-events-none" />;
        };

        const PrismaticBackground = ({ isActive = true, isLowPerf = false }) => {
            // 如果未激活，返回空div避免渲染WebGL
            if (!isActive) {
                return <div className="absolute inset-0 bg-black" />;
            }

            return (
                <div className="absolute inset-0 bg-black overflow-hidden animate-in fade-in duration-1000">
                    <PrismaticBurstWebGL 
                        animationType="rotate3d"
                        intensity={2.5} 
                        speed={0.4}
                        distort={0}
                        offset={{ x: 0, y: 0 }}
                        hoverDampness={0.25}
                        rayCount={0}
                        // 汇聚西域琉璃之彩（品红/海蓝/白/加一点代表皇室的大唐金色）
                        colors={['#ff007a', '#4d3dff', '#ffffff', '#FFD700']} 
                        isLowPerf={isLowPerf}
                    />
                    
                    {/* 微光星点增加纵深感 */}
                    <div className="absolute inset-0 bg-black opacity-30 pointer-events-none z-10"></div>
                    <div className="absolute top-[20%] left-[15%] w-[3px] h-[3px] bg-white rounded-full opacity-90 animate-pulse z-10"></div>
                    <div className="absolute top-[35%] right-[25%] w-[4px] h-[4px] bg-yellow-200 rounded-full opacity-70 animate-pulse z-10" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-[10%] left-[60%] w-[2px] h-[2px] bg-white rounded-full opacity-80 animate-pulse z-10" style={{animationDelay: '4s'}}></div>
                </div>
            );
        };
		
		// --- 新增：纪元跃迁·时光隧道特效 (Grid Scan 纯原生 WebGL 无依赖版) ---
        const TIMEWARP_VERT = `#version 300 es
			in vec2 position;
			void main() {
				gl_Position = vec4(position, 0.0, 1.0);
			}
			`;

					const TIMEWARP_FRAG = `#version 300 es
			precision highp float;
			out vec4 fragColor;

			uniform vec2 iResolution;
			uniform float iTime;
			uniform vec2 uMouse;
			uniform vec3 uLinesColor;
			uniform vec3 uScanColor;

			void main() {
				// 归一化坐标并处理屏幕比例
				vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
				
				// 鼠标交互：根据鼠标位置产生隧道的轻微偏移透视
				uv -= (uMouse - 0.5) * 0.8;
				
				// 摄像机镜头旋转晃动，增强坠落失重感
				float wobble = sin(iTime * 0.3) * 0.15;
				mat2 rot = mat2(cos(wobble), -sin(wobble), sin(wobble), cos(wobble));
				uv *= rot;
				
				// 极坐标转换构造 3D 透视隧道 (无限坠落)
				float r = length(uv);
				float a = atan(uv.y, uv.x);
				
				// z轴纵深 (中心无限远)
				float z = 1.0 / max(r, 0.005);
				
				// 时空跃迁速度 (向屏幕外冲刺)
				float t = iTime * 4.0;
				
				// Grid Scan：柱状映射计算网格线
				vec2 gridUv = vec2(a / 3.14159265 * 5.0, z + t);
				vec2 grid = fract(gridUv);
				
				// 平滑网格线条，抗锯齿
				vec2 line = smoothstep(0.0, 0.08, grid) - smoothstep(0.92, 1.0, grid);
				float intensity = max(line.x, line.y);
				
				// 流光扫描波效应 (Grid Scan Wave)
				float scanWave = sin(z * 4.0 + iTime * 12.0) * 0.5 + 0.5;
				scanWave = pow(scanWave, 3.0); // 让扫描高光更加锐利
				
				// 色彩混合：基础网格色 + 扫描高光色
				vec3 finalColor = mix(uLinesColor, uScanColor, scanWave * 0.9) * intensity;
				
				// 中心奇点：深邃的黑洞发光核心
				float core = smoothstep(0.25, 0.0, r);
				finalColor += uScanColor * core * (sin(iTime * 5.0) * 0.2 + 0.8);
				
				// 远景雾化 (Fog)，增强空间纵深感
				float fog = smoothstep(0.0, 2.5, r);
				finalColor *= fog;
				
				// 极速跃迁的全局扫描线滤镜
				float screenScan = sin(gl_FragCoord.y * 3.0 - iTime * 20.0) * 0.05;
				finalColor += screenScan * fog;
				
				fragColor = vec4(finalColor, 1.0);
			}
			`;

        const TimeWarpWebGL = ({ linesColor = '#392e4e', scanColor = '#00ffff', isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const ctnDom = useRef(null);
            const propsRef = useRef({ linesColor, scanColor });

            useEffect(() => {
                propsRef.current = { linesColor, scanColor };
            }, [linesColor, scanColor]);

            useEffect(() => {
                const ctn = ctnDom.current;
                if (!ctn) return;

                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                canvas.style.backgroundColor = '#030008'; // 深邃宇宙底色
                ctn.appendChild(canvas);

                const gl = canvas.getContext('webgl2', { alpha: false, antialias: true });
                if (!gl) {
                    console.warn("设备不支持 WebGL2，时光隧道特效无法渲染");
                    return;
                }

                const compileShader = (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
                    return shader;
                };

                const vs = compileShader(gl.VERTEX_SHADER, TIMEWARP_VERT);
                const fs = compileShader(gl.FRAGMENT_SHADER, TIMEWARP_FRAG);
                const program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);

                const locs = {
                    position: gl.getAttribLocation(program, 'position'),
                    iResolution: gl.getUniformLocation(program, 'iResolution'),
                    iTime: gl.getUniformLocation(program, 'iTime'),
                    uMouse: gl.getUniformLocation(program, 'uMouse'),
                    uLinesColor: gl.getUniformLocation(program, 'uLinesColor'),
                    uScanColor: gl.getUniformLocation(program, 'uScanColor')
                };

                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1,  3, -1,  -1, 3 ]), gl.STATIC_DRAW);

                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                gl.enableVertexAttribArray(locs.position);
                gl.vertexAttribPointer(locs.position, 2, gl.FLOAT, false, 0, 0);

                const hexToRgb01 = hex => {
                    let h = hex.trim().replace(/^#/, '');
                    if (h.length === 3) h = h.split('').map(x=>x+x).join('');
                    const intVal = parseInt(h, 16);
                    return [((intVal >> 16) & 255)/255, ((intVal >> 8) & 255)/255, (intVal & 255)/255];
                };

                let animateId;
                let lastTime = visibleAnimationNow();
                let accumTime = 0;
                const mouseSmooth = [0.5, 0.5];
                const mouseTarget = [0.5, 0.5];

                const resize = () => {
                    const width = ctn.offsetWidth || window.innerWidth;
                    const height = ctn.offsetHeight || window.innerHeight;
                    // 低性能模式下以 0.45 DPR 渲染，降低 80% 像素片元负荷，保持 1:1 时空网格跃迁质感
                    const dpr = backgroundDpr(window.devicePixelRatio, isLowPerf, isBalanced, 0.45);
                    canvas.width = Math.max(1, Math.round(width * dpr));
                    canvas.height = Math.max(1, Math.round(height * dpr));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                };
                window.addEventListener('resize', resize);
                resize();

                const onPointerMove = (e) => {
                    const x = e.clientX / window.innerWidth;
                    const y = e.clientY / window.innerHeight;
                    mouseTarget[0] = Math.min(Math.max(x, 0), 1);
                    mouseTarget[1] = Math.min(Math.max(y, 0), 1);
                };
                window.addEventListener('pointermove', onPointerMove);

                let cachedLinesColor, cachedScanColor, linesRgb, scanRgb;
                const admitFrame = createFrameGate(isBalanced ? 30 : 0);
                const render = (now) => {
                    if (!admitFrame(now)) { animateId = requestAnimationFrame(render); return; }
                    if (isLowPerf && now - lastTime < 33) {
                        animateId = requestAnimationFrame(render);
                        return; // 低性能模式限制 30 FPS 刷新率
                    }
                    const dt = Math.max(0, now - lastTime) * 0.001;
                    lastTime = now;
                    accumTime += dt;

                    // 鼠标平滑缓动插值
                    mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * 5.0 * dt;
                    mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * 5.0 * dt;

                    gl.useProgram(program);
                    gl.bindVertexArray(vao);

                    gl.uniform2f(locs.iResolution, canvas.width, canvas.height);
                    gl.uniform1f(locs.iTime, accumTime);
                    gl.uniform2f(locs.uMouse, mouseSmooth[0], mouseSmooth[1]);
                    
                    const { linesColor, scanColor } = propsRef.current;
                    if (cachedLinesColor !== linesColor) { cachedLinesColor = linesColor; linesRgb = hexToRgb01(linesColor); }
                    if (cachedScanColor !== scanColor) { cachedScanColor = scanColor; scanRgb = hexToRgb01(scanColor); }
                    gl.uniform3fv(locs.uLinesColor, linesRgb);
                    gl.uniform3fv(locs.uScanColor, scanRgb);

                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    animateId = requestAnimationFrame(render);
                };
                animateId = requestAnimationFrame(render);

                return () => {
                    cancelAnimationFrame(animateId);
                    window.removeEventListener('resize', resize);
                    window.removeEventListener('pointermove', onPointerMove);
                    if (ctn.contains(canvas)) ctn.removeChild(canvas);
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                };
            }, [isLowPerf, isBalanced]);

            return <div ref={ctnDom} className="absolute inset-0 z-0 pointer-events-none" />;
        };

        const TimeWarpBackground = ({ isActive = true, isLowPerf = false }) => {
            // 如果未激活，返回空div避免渲染WebGL
            if (!isActive) {
                return <div className="absolute inset-0 bg-black" />;
            }

            return (
                <div className="absolute inset-0 overflow-hidden animate-in fade-in duration-1000">
                    <TimeWarpWebGL 
                        linesColor="#392e4e"  // 对应文档设定的深空暗紫网格线
                        scanColor="#FF9FFC"   // 对应文档设定的霓虹品红高光扫描色
                        isLowPerf={isLowPerf}
                    />
                    {/* 增加一些前景掠过的“流光星轨”粒子束，强化坠落的速度感 */}
                    <div className="absolute top-[10%] left-[20%] w-[2px] h-[60px] bg-cyan-300 opacity-80 blur-[1px] animate-[pulse_0.4s_infinite] transform rotate-45 z-10"></div>
                    <div className="absolute top-[80%] right-[30%] w-[3px] h-[80px] bg-[#FF9FFC] opacity-60 blur-[1px] animate-[pulse_0.6s_infinite] transform -rotate-45 z-10"></div>
                    <div className="absolute top-[40%] right-[10%] w-[2px] h-[40px] bg-white opacity-90 blur-[1px] animate-[pulse_0.3s_infinite] transform rotate-12 z-10"></div>
                    <div className="absolute inset-0 bg-black opacity-10 pointer-events-none z-10"></div>
                </div>
            );
        };
		
		// --- 新增：虚空跃迁·超光速引擎特效 (Hyperspeed 纯原生 WebGL 无依赖版) ---
        const HYPERSPEED_VERT = `#version 300 es
			in vec2 position;
			void main() {
				gl_Position = vec4(position, 0.0, 1.0);
			}
			`;

					const HYPERSPEED_FRAG = `#version 300 es
			precision highp float;
			out vec4 fragColor;

			uniform vec2 uResolution;
			uniform float uTime;

			// 伪随机数生成器
			float rand(vec2 n) { 
				return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
			}

			void main() {
				// 极速跃迁的屏幕震颤效应 (Camera Shake)
				vec2 shake = vec2(sin(uTime * 50.0), cos(uTime * 45.0)) * 0.003;
				vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y + shake;
				
				float r = length(uv);
				float a = atan(uv.y, uv.x);
				
				// 极坐标转直角坐标映射，用于制造流光无限坠落拉伸
				vec2 polar = vec2(a / 6.28318, 0.2 / r);
				
				vec3 col = vec3(0.0);
				
				// 多层超光速星轨叠加 (多维空间光束)
				for (float i = 0.0; i < 4.0; i++) {
					float t = uTime * (5.0 + i * 2.5); // 极高的跃迁速度
					vec2 grid = vec2(polar.x * (40.0 + i * 15.0), polar.y + t);
					vec2 id = floor(grid);
					vec2 f = fract(grid);
					
					float n = rand(id + i * 10.0); // 每一道光束的随机种子
					
					// 绘制星轨线条
					float xDist = abs(f.x - 0.5);
					float line = smoothstep(0.1 * n, 0.0, xDist);
					
					// 头部高亮与长尾拖影
					float tail = smoothstep(1.0, 0.1, f.y);
					float head = smoothstep(0.0, 0.05, f.y);
					
					// 科幻曲率调色板 (冰蓝、品红、纯白)
					vec3 c1 = vec3(0.0, 0.8, 1.0);
					vec3 c2 = vec3(1.0, 0.2, 0.8);
					vec3 trailColor = mix(c1, c2, rand(id + 1.5));
					// 设定 15% 的高能纯白光束，增加刺眼感
					trailColor = mix(trailColor, vec3(1.0), step(0.85, rand(id + 2.5))); 
					
					// 光束靠近屏幕边缘（r较大）时变亮并产生畸变，完美模拟 3D 透视冲刺感
					float intensity = line * tail * head * r * 12.0 * step(0.4, n);
					
					col += trailColor * intensity;
				}
				
				// 中心曲率引擎的深邃强光 (Warp Core)
				float core = smoothstep(0.35, 0.0, r);
				col += vec3(0.3, 0.6, 1.0) * core * (sin(uTime * 30.0) * 0.2 + 0.8);
				
				// 边缘失真与渐暗缩放 (Vignette)
				col *= smoothstep(1.5, 0.0, r);
				
				fragColor = vec4(col, 1.0);
			}
			`;

        const HyperspeedWebGL = ({ isLowPerf = false }) => {
            const { isBalanced = false } = useContext(PerformanceContext);
            const ctnDom = useRef(null);

            useEffect(() => {
                const ctn = ctnDom.current;
                if (!ctn) return;

                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
                canvas.style.backgroundColor = '#000000'; // 纯粹的虚空黑
                ctn.appendChild(canvas);

                const gl = canvas.getContext('webgl2', { alpha: false, antialias: true });
                if (!gl) {
                    console.warn("设备不支持 WebGL2，超光速特效无法渲染");
                    return;
                }

                const compileShader = (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
                    return shader;
                };

                const vs = compileShader(gl.VERTEX_SHADER, HYPERSPEED_VERT);
                const fs = compileShader(gl.FRAGMENT_SHADER, HYPERSPEED_FRAG);
                const program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);

                const locs = {
                    position: gl.getAttribLocation(program, 'position'),
                    uResolution: gl.getUniformLocation(program, 'uResolution'),
                    uTime: gl.getUniformLocation(program, 'uTime'),
                };

                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1,  3, -1,  -1, 3 ]), gl.STATIC_DRAW);

                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                gl.enableVertexAttribArray(locs.position);
                gl.vertexAttribPointer(locs.position, 2, gl.FLOAT, false, 0, 0);

                let animateId;
                let lastTime = visibleAnimationNow();
                let accumTime = 0;

                const resize = () => {
                    const width = ctn.offsetWidth || window.innerWidth;
                    const height = ctn.offsetHeight || window.innerHeight;
                    // 低性能模式下以 0.45 DPR 渲染，降低 80% 像素片元负荷，1:1 保留极速空间跃迁光束
                    const dpr = backgroundDpr(window.devicePixelRatio, isLowPerf, isBalanced, 0.45);
                    canvas.width = Math.max(1, Math.round(width * dpr));
                    canvas.height = Math.max(1, Math.round(height * dpr));
                    gl.viewport(0, 0, canvas.width, canvas.height);
                };
                window.addEventListener('resize', resize);
                resize();

                const admitFrame = createFrameGate(isBalanced ? 30 : 0);
                const render = (now) => {
                    if (!admitFrame(now)) { animateId = requestAnimationFrame(render); return; }
                    if (isLowPerf && now - lastTime < 33) {
                        animateId = requestAnimationFrame(render);
                        return; // 低性能模式限制 30 FPS 刷新率
                    }
                    const dt = Math.max(0, now - lastTime) * 0.001;
                    lastTime = now;
                    accumTime += dt;

                    gl.useProgram(program);
                    gl.bindVertexArray(vao);

                    gl.uniform2f(locs.uResolution, canvas.width, canvas.height);
                    gl.uniform1f(locs.uTime, accumTime);

                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    animateId = requestAnimationFrame(render);
                };
                animateId = requestAnimationFrame(render);

                return () => {
                    cancelAnimationFrame(animateId);
                    window.removeEventListener('resize', resize);
                    if (ctn.contains(canvas)) ctn.removeChild(canvas);
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                };
            }, [isLowPerf, isBalanced]);

            return <div ref={ctnDom} className="absolute inset-0 z-0 pointer-events-none" />;
        };

        const HyperspeedBackground = ({ isActive = true, isLowPerf = false }) => {
            // 如果未激活，返回空div避免渲染WebGL
            if (!isActive) {
                return <div className="absolute inset-0 bg-black" />;
            }

            return (
                <div className="absolute inset-0 overflow-hidden animate-in zoom-in duration-700">
                    <HyperspeedWebGL isLowPerf={isLowPerf} />
                    
                    {/* 添加极速跃迁时的屏幕边缘运动模糊与暗角，提升沉浸与速度感 */}
                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-10"></div>
                    
                    {/* 模拟迎面砸来的超大星轨残影 */}
                    <div className="absolute top-[50%] left-[5%] w-[100px] h-[2px] bg-white opacity-40 blur-[2px] animate-[pulse_0.1s_infinite] transform -rotate-12 z-10"></div>
                    <div className="absolute top-[20%] right-[10%] w-[150px] h-[3px] bg-cyan-300 opacity-50 blur-[3px] animate-[pulse_0.15s_infinite] transform rotate-12 z-10"></div>
                </div>
            );
        };
		
        // 低性能模式下轻量化纯 CSS 特效组件（零 WebGL/Canvas CPU 开销，纯 GPU 硬件加速，保留生动动态视觉与主题象征）
        const LowPerfGalaxy = () => {
            // 32 颗错落分布的星辰 (4 颗十字星芒巨星 + 12 颗中亮星 + 16 颗深空微尘)
            const stars = [
                // 4 颗十字大星
                { x: '18%', y: '22%', size: 'w-2 h-2', isCross: true, color: '#ffffff', delay: '0s' },
                { x: '78%', y: '18%', size: 'w-2 h-2', isCross: true, color: '#fbcfe8', delay: '1.5s' },
                { x: '45%', y: '48%', size: 'w-2 h-2', isCross: true, color: '#e0e7ff', delay: '2.8s' },
                { x: '82%', y: '65%', size: 'w-1.5 h-1.5', isCross: true, color: '#c7d2fe', delay: '0.8s' },
                // 中亮星
                { x: '8%', y: '12%', size: 'w-1.5 h-1.5', color: '#ffffff', delay: '0.4s' },
                { x: '28%', y: '35%', size: 'w-1.5 h-1.5', color: '#c7d2fe', delay: '1.8s' },
                { x: '62%', y: '15%', size: 'w-1.5 h-1.5', color: '#fae8ff', delay: '2.2s' },
                { x: '88%', y: '32%', size: 'w-1.5 h-1.5', color: '#fbcfe8', delay: '0.6s' },
                { x: '14%', y: '68%', size: 'w-1.5 h-1.5', color: '#ffffff', delay: '1.2s' },
                { x: '35%', y: '80%', size: 'w-1.5 h-1.5', color: '#e0e7ff', delay: '2.5s' },
                { x: '58%', y: '72%', size: 'w-1.5 h-1.5', color: '#f472b6', delay: '0.9s' },
                { x: '72%', y: '42%', size: 'w-1.5 h-1.5', color: '#ffffff', delay: '1.7s' },
                { x: '92%', y: '82%', size: 'w-1.5 h-1.5', color: '#c7d2fe', delay: '2.0s' },
                { x: '50%', y: '25%', size: 'w-1.5 h-1.5', color: '#ffffff', delay: '0.3s' },
                { x: '22%', y: '52%', size: 'w-1.5 h-1.5', color: '#fae8ff', delay: '2.7s' },
                { x: '66%', y: '88%', size: 'w-1.5 h-1.5', color: '#fbcfe8', delay: '1.1s' },
                // 深空飘拂微尘星
                { x: '5%', y: '40%', size: 'w-1 h-1', color: '#93c5fd', drift: true, delay: '0s' },
                { x: '12%', y: '85%', size: 'w-1 h-1', color: '#c084fc', drift: true, delay: '1.2s' },
                { x: '24%', y: '10%', size: 'w-1 h-1', color: '#ffffff', drift: true, delay: '2.4s' },
                { x: '32%', y: '60%', size: 'w-1 h-1', color: '#e0e7ff', drift: true, delay: '3.6s' },
                { x: '40%', y: '18%', size: 'w-1 h-1', color: '#fbcfe8', drift: true, delay: '0.8s' },
                { x: '48%', y: '90%', size: 'w-1 h-1', color: '#93c5fd', drift: true, delay: '2.0s' },
                { x: '55%', y: '38%', size: 'w-1 h-1', color: '#ffffff', drift: true, delay: '3.2s' },
                { x: '65%', y: '55%', size: 'w-1 h-1', color: '#c7d2fe', drift: true, delay: '1.6s' },
                { x: '75%', y: '5%', size: 'w-1 h-1', color: '#fae8ff', drift: true, delay: '2.8s' },
                { x: '80%', y: '78%', size: 'w-1 h-1', color: '#f472b6', drift: true, delay: '0.4s' },
                { x: '86%', y: '50%', size: 'w-1 h-1', color: '#ffffff', drift: true, delay: '1.9s' },
                { x: '95%', y: '20%', size: 'w-1 h-1', color: '#c084fc', drift: true, delay: '3.1s' },
                { x: '30%', y: '22%', size: 'w-1 h-1', color: '#93c5fd', drift: true, delay: '0.7s' },
                { x: '60%', y: '30%', size: 'w-1 h-1', color: '#e0e7ff', drift: true, delay: '2.1s' },
                { x: '42%', y: '70%', size: 'w-1 h-1', color: '#ffffff', drift: true, delay: '3.5s' },
                { x: '70%', y: '28%', size: 'w-1 h-1', color: '#fbcfe8', drift: true, delay: '1.4s' }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0724] via-[#140c3d] via-[#1b104b] to-[#060417] overflow-hidden pointer-events-none">
                    {/* 银河螺旋大星云 1（蓝紫星云, 呼吸缩放与微自旋） */}
                    <div
                        className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_35%_35%,_var(--tw-gradient-stops))] from-indigo-500/50 via-purple-700/35 via-fuchsia-950/25 to-transparent blur-3xl pointer-events-none"
                        style={{ animation: 'galaxy-nebula-breathe 14s ease-in-out infinite' }}
                    />

                    {/* 银河银心粉紫华彩 2（错开相位呼吸） */}
                    <div
                        className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_65%_45%,rgba(244,114,182,0.4)_0%,rgba(168,85,247,0.25)_40%,transparent_70%)] blur-2xl pointer-events-none"
                        style={{ animation: 'galaxy-nebula-breathe 18s ease-in-out infinite -7s' }}
                    />

                    {/* 深邃星尘背景图层 */}
                    <div
                        className="absolute inset-0 opacity-75 pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 120px 150px, #e0e7ff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 240px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 360px 220px, #fbcfe8, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 500px 120px, #c7d2fe, rgba(0,0,0,0)), radial-gradient(2px 2px at 640px 300px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 780px 180px, #fae8ff, rgba(0,0,0,0))',
                            backgroundSize: '780px 400px'
                        }}
                    />

                    {/* 32 颗独立呼吸与漂浮星辰 */}
                    {stars.map((s, idx) => (
                        <div
                            key={idx}
                            className="absolute pointer-events-none"
                            style={{
                                left: s.x,
                                top: s.y,
                                animation: s.drift
                                    ? `galaxy-star-drift 8s ease-in-out infinite ${s.delay}`
                                    : `lowperf-star-twinkle 3s ease-in-out infinite ${s.delay}`
                            }}
                        >
                            {s.isCross ? (
                                <div className="relative flex items-center justify-center">
                                    <div
                                        className={`${s.size} rounded-full`}
                                        style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}, 0 0 16px #ffffff` }}
                                    />
                                    {/* 十字星芒衍射光针 */}
                                    <div
                                        className="absolute w-5 h-[1.5px] rounded-full pointer-events-none"
                                        style={{ backgroundColor: s.color, opacity: 0.85 }}
                                    />
                                    <div
                                        className="absolute h-5 w-[1.5px] rounded-full pointer-events-none"
                                        style={{ backgroundColor: s.color, opacity: 0.85 }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`${s.size} rounded-full`}
                                    style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}
                                />
                            )}
                        </div>
                    ))}

                    {/* 底部暗色遮罩保护内容 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
                </div>
            );
        };

        const LowPerfAurora = () => {
            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#02181b] via-[#042831] via-[#06333c] to-[#010e13] overflow-hidden pointer-events-none">
                    {/* 极光主光幕 1（翡翠绿与碧青光帘，动态摇曳摆动） */}
                    <div
                        className="absolute -top-12 -left-20 -right-20 h-[68%] opacity-65 pointer-events-none blur-2xl"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.5) 30%, rgba(45, 212, 191, 0.45) 60%, rgba(99, 102, 241, 0.3) 85%, transparent 100%)',
                            animation: 'aurora-wave-sway-1 8s ease-in-out infinite'
                        }}
                    />

                    {/* 极光次级跃动光幕 2（青荧与幻紫交织，错相流动） */}
                    <div
                        className="absolute top-4 -left-10 -right-10 h-[52%] opacity-55 pointer-events-none blur-2xl"
                        style={{
                            background:
                                'linear-gradient(120deg, rgba(56, 189, 248, 0.5) 0%, rgba(168, 85, 247, 0.55) 45%, rgba(236, 72, 153, 0.35) 75%, transparent 95%)',
                            animation: 'aurora-wave-sway-2 11s ease-in-out infinite -3.5s'
                        }}
                    />

                    {/* 极光高空透亮光带 3（嫩绿高光波纹） */}
                    <div
                        className="absolute top-0 left-[8%] right-[8%] h-[38%] opacity-60 pointer-events-none blur-xl"
                        style={{
                            background:
                                'linear-gradient(150deg, rgba(134, 239, 172, 0.65) 0%, rgba(52, 211, 153, 0.45) 50%, transparent 80%)',
                            animation: 'aurora-wave-sway-1 9.5s ease-in-out infinite -5s'
                        }}
                    />

                    {/* 极地清朗冰晶星辰点阵 */}
                    <div
                        className="absolute inset-0 opacity-80 pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(2px 2px at 45px 60px, #d1fae5, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 170px 110px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 320px 80px, #cffafe, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 500px 150px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 660px 90px, #a7f3d0, rgba(0,0,0,0)), radial-gradient(2px 2px at 820px 140px, #ffffff, rgba(0,0,0,0))',
                            backgroundSize: '820px 360px'
                        }}
                    />

                    {/* 极地冰原与山脉轮廓剪影 */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-32 opacity-90 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, #010a0e 0%, #03161c 70%, transparent 100%)',
                            clipPath:
                                'polygon(0% 100%, 0% 78%, 10% 72%, 18% 78%, 28% 66%, 40% 79%, 52% 64%, 64% 78%, 76% 68%, 88% 79%, 100% 72%, 100% 100%)'
                        }}
                    />
                </div>
            );
        };

        const LowPerfPrismatic = () => {
            return (
                <div className="absolute inset-0 bg-gradient-to-br from-[#260533] via-[#480a4f] via-[#310425] to-[#12021c] overflow-hidden pointer-events-none flex items-center justify-center">
                    {/* 彩虹琉璃光谱旋转射线轮盘 1 */}
                    <div
                        className="absolute w-[850px] h-[850px] rounded-full opacity-45 pointer-events-none blur-lg"
                        style={{
                            background:
                                'conic-gradient(from 0deg, rgba(244,63,94,0.4) 0deg, rgba(234,179,8,0.4) 60deg, rgba(34,197,94,0.4) 120deg, rgba(6,182,212,0.4) 180deg, rgba(168,85,247,0.4) 240deg, rgba(236,72,153,0.4) 300deg, rgba(244,63,94,0.4) 360deg)',
                            animation: 'prismatic-ray-spin 25s linear infinite'
                        }}
                    />

                    {/* 逆向旋转的第二重光谱漫射 2 */}
                    <div
                        className="absolute w-[700px] h-[700px] rounded-full opacity-35 pointer-events-none blur-xl"
                        style={{
                            background:
                                'conic-gradient(from 180deg, rgba(56,189,248,0.35) 0deg, rgba(168,85,247,0.35) 90deg, rgba(244,63,94,0.35) 180deg, rgba(234,179,8,0.35) 270deg, rgba(56,189,248,0.35) 360deg)',
                            animation: 'prismatic-ray-spin 18s linear infinite reverse'
                        }}
                    />

                    {/* 中心登科及第·琉璃晶核光芒 */}
                    <div
                        className="relative w-28 h-28 pointer-events-none"
                        style={{ animation: 'prismatic-star-pulse 4.5s ease-in-out infinite' }}
                    >
                        {/* 八芒晶钻衍射星 */}
                        <div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-fuchsia-400 via-pink-300 to-amber-200 opacity-80"
                            style={{ transform: 'rotate(45deg)', boxShadow: '0 0 35px rgba(236, 72, 153, 0.9)' }}
                        />
                        <div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300 via-purple-300 to-rose-300 opacity-80"
                            style={{ transform: 'rotate(0deg)', boxShadow: '0 0 25px rgba(168, 85, 247, 0.9)' }}
                        />
                        {/* 核心白光极核 */}
                        <div className="absolute inset-3 rounded-full bg-white blur-[2px] opacity-95" />
                    </div>

                    {/* 漫天七彩晶钻折射火彩星尘 */}
                    <div
                        className="absolute inset-0 opacity-70 pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(2.5px 2.5px at 80px 70px, #fde047, rgba(0,0,0,0)), radial-gradient(2px 2px at 250px 180px, #f472b6, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 450px 100px, #c084fc, rgba(0,0,0,0)), radial-gradient(2px 2px at 620px 220px, #38bdf8, rgba(0,0,0,0)), radial-gradient(2px 2px at 780px 120px, #4ade80, rgba(0,0,0,0))',
                            backgroundSize: '780px 320px'
                        }}
                    />

                    {/* 边缘暗夜保护遮罩 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(18,2,28,0.7)_100%)] pointer-events-none" />
                </div>
            );
        };

        const LowPerfTimeWarp = () => {
            // 4 道同心扩张的时空跃迁引力波环
            const warpRings = [
                { delay: '0s', borderClass: 'border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.7)]' },
                { delay: '1.0s', borderClass: 'border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.7)]' },
                { delay: '2.0s', borderClass: 'border-pink-400/60 shadow-[0_0_20px_rgba(244,114,182,0.7)]' },
                { delay: '3.0s', borderClass: 'border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.7)]' }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#090526] via-[#160c40] to-[#040214] overflow-hidden pointer-events-none flex items-center justify-center">
                    {/* 中心时空奇点辉光 */}
                    <div className="absolute w-64 h-64 rounded-full opacity-65 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-cyan-400/80 via-purple-600/50 to-transparent blur-xl pointer-events-none" />

                    {/* 4 层不断向外扑面膨胀的时空环 */}
                    {warpRings.map((ring, idx) => (
                        <div
                            key={idx}
                            className={`absolute w-72 h-72 rounded-full border-2 ${ring.borderClass} pointer-events-none`}
                            style={{
                                animation: `timewarp-ring-expand 4s cubic-bezier(0.15, 0.85, 0.35, 1) infinite ${ring.delay}`
                            }}
                        />
                    ))}

                    {/* 纵深放射星轨折痕 */}
                    <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                            backgroundImage:
                                'conic-gradient(from 0deg, transparent 0deg, rgba(168,85,247,0.4) 15deg, transparent 30deg, transparent 60deg, rgba(56,189,248,0.4) 75deg, transparent 90deg, transparent 150deg, rgba(244,114,182,0.4) 165deg, transparent 180deg, transparent 240deg, rgba(168,85,247,0.4) 255deg, transparent 270deg)',
                            backgroundSize: '100% 100%'
                        }}
                    />

                    {/* 核心奇点小白洞 */}
                    <div className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_40px_#38bdf8] pointer-events-none animate-pulse" />
                </div>
            );
        };

        const LowPerfHyperspeed = () => {
            // 8 道超光速横贯极速光束
            const lasers = [
                { top: '12%', height: '2px', width: '360px', color: '#38bdf8', glow: '#38bdf8', duration: '1.4s', delay: '0s' },
                { top: '22%', height: '3px', width: '450px', color: '#c084fc', glow: '#a855f7', duration: '1.8s', delay: '0.4s' },
                { top: '35%', height: '2.5px', width: '400px', color: '#ffffff', glow: '#38bdf8', duration: '1.2s', delay: '0.9s' },
                { top: '48%', height: '2px', width: '320px', color: '#f472b6', glow: '#ec4899', duration: '1.6s', delay: '0.2s' },
                { top: '60%', height: '3px', width: '480px', color: '#67e8f9', glow: '#06b6d4', duration: '1.3s', delay: '0.7s' },
                { top: '72%', height: '2px', width: '380px', color: '#a855f7', glow: '#c084fc', duration: '1.7s', delay: '0.5s' },
                { top: '85%', height: '2.5px', width: '420px', color: '#38bdf8', glow: '#0284c7', duration: '1.5s', delay: '1.1s' },
                { top: '93%', height: '2px', width: '350px', color: '#ffffff', glow: '#ffffff', duration: '1.1s', delay: '0.3s' }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#020b18] via-[#051833] to-[#01060e] overflow-hidden pointer-events-none">
                    {/* 曲率引擎聚光核心 */}
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/40 via-blue-600/25 to-transparent pointer-events-none" />

                    {/* 8 道超光速霓虹激光束 */}
                    {lasers.map((l, idx) => (
                        <div
                            key={idx}
                            className="absolute pointer-events-none"
                            style={{
                                top: l.top,
                                height: l.height,
                                width: l.width,
                                background: `linear-gradient(to left, transparent, ${l.color} 70%, #ffffff 100%)`,
                                boxShadow: `0 0 12px ${l.glow}, 0 0 24px ${l.glow}`,
                                animation: `hyperspeed-laser-run ${l.duration} linear infinite ${l.delay}`
                            }}
                        >
                            {/* 激光穿梭前端超强光斑 */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                                style={{ boxShadow: `0 0 10px #ffffff, 0 0 20px ${l.glow}` }}
                            />
                        </div>
                    ))}

                    {/* 边缘暗夜保护 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                </div>
            );
        };

        const LowPerfMeteor = () => {
            // 5 颗错落划破长夜的流星
            const meteors = [
                { left: '22%', top: '8%', width: '160px', color: '#ffffff', glow: 'rgba(255,255,255,0.9)', duration: '4.2s', delay: '0s' },
                { left: '68%', top: '16%', width: '140px', color: '#67e8f9', glow: 'rgba(103,232,249,0.9)', duration: '5.5s', delay: '1.8s' },
                { left: '44%', top: '10%', width: '180px', color: '#fef08a', glow: 'rgba(254,240,138,0.9)', duration: '4.6s', delay: '3.2s' },
                { left: '85%', top: '24%', width: '130px', color: '#c084fc', glow: 'rgba(192,132,252,0.9)', duration: '6.0s', delay: '4.5s' },
                { left: '12%', top: '28%', width: '150px', color: '#ffffff', glow: 'rgba(255,255,255,0.9)', duration: '5.0s', delay: '2.5s' }
            ];

            // 24 颗闪烁恒星
            const stars = [
                { x: '10%', y: '15%', size: 'w-1.5 h-1.5', delay: '0.2s' },
                { x: '25%', y: '25%', size: 'w-2 h-2', delay: '1.4s' },
                { x: '38%', y: '12%', size: 'w-1 h-1', delay: '2.1s' },
                { x: '52%', y: '30%', size: 'w-1.5 h-1.5', delay: '0.8s' },
                { x: '65%', y: '18%', size: 'w-2 h-2', delay: '2.5s' },
                { x: '78%', y: '35%', size: 'w-1 h-1', delay: '1.1s' },
                { x: '90%', y: '20%', size: 'w-1.5 h-1.5', delay: '0.5s' },
                { x: '15%', y: '50%', size: 'w-1 h-1', delay: '1.8s' },
                { x: '30%', y: '65%', size: 'w-1.5 h-1.5', delay: '2.7s' },
                { x: '45%', y: '55%', size: 'w-2 h-2', delay: '0.9s' },
                { x: '60%', y: '70%', size: 'w-1 h-1', delay: '2.2s' },
                { x: '74%', y: '58%', size: 'w-1.5 h-1.5', delay: '1.6s' },
                { x: '88%', y: '72%', size: 'w-2 h-2', delay: '0.4s' },
                { x: '5%', y: '80%', size: 'w-1 h-1', delay: '1.9s' },
                { x: '95%', y: '45%', size: 'w-1.5 h-1.5', delay: '2.8s' },
                { x: '40%', y: '82%', size: 'w-1 h-1', delay: '0.7s' }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#080d24] via-[#121a3b] to-[#050817] overflow-hidden pointer-events-none">
                    {/* 深空午夜星云光晕 */}
                    <div className="absolute inset-0 opacity-45 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/40 via-blue-900/25 to-transparent blur-2xl pointer-events-none" />

                    {/* 璀璨恒星群 */}
                    {stars.map((s, idx) => (
                        <div
                            key={idx}
                            className={`absolute ${s.size} bg-white rounded-full pointer-events-none`}
                            style={{
                                left: s.x,
                                top: s.y,
                                boxShadow: '0 0 6px rgba(255,255,255,0.85)',
                                animation: `lowperf-star-twinkle 3s ease-in-out infinite ${s.delay}`
                            }}
                        />
                    ))}

                    {/* 5 颗优雅划过长夜的纯 CSS 流星 */}
                    {meteors.map((m, idx) => (
                        <div
                            key={idx}
                            className="absolute h-[2px] rounded-full opacity-0 pointer-events-none"
                            style={{
                                left: m.left,
                                top: m.top,
                                width: m.width,
                                background: `linear-gradient(to right, transparent, ${m.color})`,
                                boxShadow: `0 0 10px ${m.glow}, 0 0 20px ${m.glow}`,
                                animation: `lowperf-meteor-streak ${m.duration} linear infinite ${m.delay}`
                            }}
                        >
                            {/* 流星头部耀眼高光 */}
                            <div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: m.color, boxShadow: `0 0 8px #ffffff, 0 0 14px ${m.glow}` }}
                            />
                        </div>
                    ))}

                    {/* 底部微光渐变，确保底部内容舒适可见 */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050817] to-transparent opacity-85 pointer-events-none" />
                </div>
            );
        };

        const LowPerfMatrix = () => {
            // 12 列连续降落的赛博数码雨 (纯 CSS 硬件加速, 错开延迟与速度)
            const streams = [
                { left: '4%', duration: '6.2s', delay: '-1.5s', chars: ['1', '0', '天', '奎', 'A', '7', '地', 'F'] },
                { left: '12%', duration: '5.0s', delay: '-3.8s', chars: ['0', '文', '9', '星', 'X', '字', '0', '1'] },
                { left: '20%', duration: '7.1s', delay: '-0.7s', chars: ['象', '1', '形', '4', '神', 'C', '化', '0'] },
                { left: '28%', duration: '5.6s', delay: '-4.2s', chars: ['0', '始', '制', '8', '2', '仓', '颉', '1'] },
                { left: '37%', duration: '6.8s', delay: '-2.1s', chars: ['玄', '黄', '0', '1', 'E', 'B', '秘', '阵'] },
                { left: '46%', duration: '4.8s', delay: '-5.0s', chars: ['1', '万', '象', '0', 'F', '3', '纪', '元'] },
                { left: '55%', duration: '6.4s', delay: '-1.2s', chars: ['奎', '0', '星', '1', 'D', '9', '始', '创'] },
                { left: '64%', duration: '5.2s', delay: '-3.4s', chars: ['字', '8', '符', '0', '1', 'A', '穿', '梭'] },
                { left: '73%', duration: '7.5s', delay: '-0.4s', chars: ['重', '组', '1', '0', '演', '变', '4', 'C'] },
                { left: '82%', duration: '5.9s', delay: '-4.6s', chars: ['0', '沧', '海', '1', '桑', '田', 'E', '0'] },
                { left: '90%', duration: '6.5s', delay: '-2.8s', chars: ['1', '0', '天', '地', '8', 'B', '神', '符'] },
                { left: '96%', duration: '5.4s', delay: '-5.5s', chars: ['0', '文', '字', '1', '奎', '星', '0', '1'] }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#02130c] via-[#042417] to-[#010e08] overflow-hidden pointer-events-none select-none">
                    {/* 赛博核心翠绿辉光 */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/35 via-emerald-950/20 to-transparent blur-2xl pointer-events-none" />

                    {/* 浅淡的赛博经纬数据网格 */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.25) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* 12 列流动的数码雨 */}
                    {streams.map((stream, idx) => (
                        <div
                            key={idx}
                            className="absolute top-0 flex flex-col items-center pointer-events-none"
                            style={{
                                left: stream.left,
                                animation: `matrix-stream-fall ${stream.duration} linear infinite ${stream.delay}`,
                                fontFamily: "'Courier New', 'OracleBone', monospace"
                            }}
                        >
                            {stream.chars.map((char, cIdx) => {
                                const isHead = cIdx === 0;
                                const isNearHead = cIdx === 1 || cIdx === 2;
                                return (
                                    <span
                                        key={cIdx}
                                        className="block my-[2px] leading-tight text-center"
                                        style={{
                                            fontSize: isHead ? '1.15rem' : '0.95rem',
                                            fontWeight: isHead ? '900' : '600',
                                            color: isHead ? '#ffffff' : isNearHead ? '#86efac' : '#22c55e',
                                            opacity: isHead ? 1 : Math.max(0.2, 0.9 - cIdx * 0.1),
                                            textShadow: isHead
                                                ? '0 0 8px #ffffff, 0 0 16px #4ade80, 0 0 24px #22c55e'
                                                : isNearHead
                                                ? '0 0 6px #4ade80'
                                                : 'none'
                                        }}
                                    >
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    ))}

                    {/* 边缘暗角保护页面主内容清晰度 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
                </div>
            );
        };

        const LowPerfOracleSands = () => {
            // 10 列垂直倾泻的金沙甲骨文流光 (秘境·甲骨流沙点金成石)
            const streams = [
                { left: '6%', duration: '6.5s', delay: '-1.2s', chars: ['日', '月', '山', '川', '天', '地', '鼎'] },
                { left: '15%', duration: '8.2s', delay: '-4.5s', chars: ['龙', '凤', '易', '德', '和', '泰', '恒'] },
                { left: '25%', duration: '5.8s', delay: '-0.8s', chars: ['星', '辰', '武', '安', '昌', '帝', '旅'] },
                { left: '36%', duration: '7.4s', delay: '-3.1s', chars: ['甲', '骨', '流', '沙', '金', '石', '文'] },
                { left: '47%', duration: '6.0s', delay: '-5.2s', chars: ['天', '行', '健', '君', '子', '自', '强'] },
                { left: '57%', duration: '8.0s', delay: '-2.0s', chars: ['地', '势', '坤', '厚', '德', '载', '物'] },
                { left: '68%', duration: '5.5s', delay: '-4.0s', chars: ['鼎', '盛', '千', '秋', '光', '芒', '万'] },
                { left: '78%', duration: '7.8s', delay: '-1.6s', chars: ['奎', '壁', '联', '辉', '仓', '颉', '作'] },
                { left: '88%', duration: '6.2s', delay: '-3.7s', chars: ['山', '川', '日', '月', '天', '地', '长'] },
                { left: '95%', duration: '7.0s', delay: '-5.8s', chars: ['金', '沙', '秘', '境', '岁', '月', '沉'] }
            ];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#1f1007] via-[#2c170b] to-[#120803] overflow-hidden pointer-events-none select-none">
                    {/* 中心温润青铜赤金氛围辉光 */}
                    <div className="absolute inset-0 opacity-45 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/40 via-amber-900/25 to-transparent blur-2xl pointer-events-none" />

                    {/* 漫天金沙点阵微粒 */}
                    <div
                        className="absolute inset-0 opacity-75 pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(1.5px 1.5px at 30px 40px, #fde047, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 160px, #fbbf24, rgba(0,0,0,0)), radial-gradient(2px 2px at 280px 80px, #f59e0b, rgba(0,0,0,0)), radial-gradient(1px 1px at 450px 200px, #fde047, rgba(0,0,0,0)), radial-gradient(2px 2px at 620px 130px, #d97706, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 780px 250px, #fbbf24, rgba(0,0,0,0))',
                            backgroundSize: '780px 380px'
                        }}
                    />

                    {/* 10 列金色甲骨文字流沙瀑布 */}
                    {streams.map((stream, idx) => (
                        <div
                            key={idx}
                            className="absolute top-0 flex flex-col items-center pointer-events-none"
                            style={{
                                left: stream.left,
                                animation: `oracle-stream-fall ${stream.duration} linear infinite ${stream.delay}`,
                                fontFamily: "'OracleBone', '方正甲骨文.TTF', '方正甲骨文', 'STKaiti', serif"
                            }}
                        >
                            {stream.chars.map((char, cIdx) => {
                                const isHead = cIdx === 0;
                                const isNearHead = cIdx === 1 || cIdx === 2;
                                return (
                                    <span
                                        key={cIdx}
                                        className="block my-1 leading-tight text-center"
                                        style={{
                                            fontSize: isHead ? '1.35rem' : '1.1rem',
                                            fontWeight: '900',
                                            color: isHead ? '#fef08a' : isNearHead ? '#fbbf24' : '#d97706',
                                            opacity: isHead ? 1 : Math.max(0.25, 0.85 - cIdx * 0.1),
                                            textShadow: isHead
                                                ? '0 0 10px #fde047, 0 0 20px #f59e0b, 0 0 32px #d97706'
                                                : isNearHead
                                                ? '0 0 8px rgba(245, 158, 11, 0.7)'
                                                : 'none'
                                        }}
                                    >
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    ))}

                    {/* 底部暗金岩壁与苍茫大地余晖 */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-32 opacity-80 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, #0d0502 0%, #1e0d05 70%, transparent 100%)',
                            clipPath:
                                'polygon(0% 100%, 0% 70%, 12% 78%, 24% 64%, 38% 75%, 52% 62%, 65% 76%, 78% 66%, 89% 74%, 100% 68%, 100% 100%)'
                        }}
                    />
                </div>
            );
        };

        const LowPerfFireworks = () => {
            // 4 处错落绽放的除夕礼花：金色牡丹、绛红锦绣、天青流火、紫玉琼华
            const fireworkSites = [
                {
                    id: 'site-1',
                    left: '24%',
                    top: '26%',
                    colorName: 'gold',
                    coreColor: 'rgba(254, 240, 138, 0.95)',
                    sparkColors: ['#fef08a', '#fbbf24', '#f59e0b', '#fff'],
                    delay: '0s',
                    duration: '3.8s',
                    scale: 1.05
                },
                {
                    id: 'site-2',
                    left: '76%',
                    top: '20%',
                    colorName: 'rose',
                    coreColor: 'rgba(251, 113, 133, 0.95)',
                    sparkColors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a'],
                    delay: '1.4s',
                    duration: '4.2s',
                    scale: 1.15
                },
                {
                    id: 'site-3',
                    left: '50%',
                    top: '15%',
                    colorName: 'cyan',
                    coreColor: 'rgba(103, 232, 249, 0.95)',
                    sparkColors: ['#38bdf8', '#67e8f9', '#a5f3fc', '#ffffff'],
                    delay: '2.6s',
                    duration: '3.6s',
                    scale: 0.95
                },
                {
                    id: 'site-4',
                    left: '36%',
                    top: '40%',
                    colorName: 'purple',
                    coreColor: 'rgba(216, 180, 254, 0.95)',
                    sparkColors: ['#c084fc', '#e879f9', '#f0abfc', '#fde047'],
                    delay: '0.8s',
                    duration: '4.0s',
                    scale: 0.9
                }
            ];

            // 每朵烟花 12 个方向的辐射火星
            const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

            return (
                <div className="absolute inset-0 bg-gradient-to-b from-[#090e24] via-[#1a081a] via-[#240614] to-[#450914] overflow-hidden pointer-events-none">
                    {/* 远景除夕万家灯火与地平线温润彤红霞光 */}
                    <div className="absolute bottom-0 left-0 right-0 h-[48%] opacity-60 bg-gradient-to-t from-red-600/50 via-amber-500/30 to-transparent pointer-events-none" />

                    {/* 4组错落升空并绽放的礼花 */}
                    {fireworkSites.map(site => (
                        <div
                            key={site.id}
                            className="absolute pointer-events-none"
                            style={{
                                left: site.left,
                                top: site.top,
                                transform: `scale(${site.scale})`
                            }}
                        >
                            {/* 升空火箭拖尾轨迹 */}
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[160px] bg-gradient-to-t from-transparent via-amber-300 to-white rounded-full opacity-0 pointer-events-none"
                                style={{
                                    transformOrigin: 'bottom center',
                                    animation: `firework-rocket-launch ${site.duration} ease-out infinite ${site.delay}`
                                }}
                            />

                            {/* 爆炸中心瞬时高光光球 */}
                            <div
                                className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0 blur-sm"
                                style={{
                                    background: `radial-gradient(circle, ${site.coreColor} 0%, rgba(255,255,255,0.8) 35%, transparent 70%)`,
                                    animation: `firework-center-flash ${site.duration} ease-out infinite ${site.delay}`
                                }}
                            />

                            {/* 12条自然重力下坠的弧形辐射火星 */}
                            {angles.map((deg, idx) => {
                                const rad = (deg * Math.PI) / 180;
                                const dist = 55 + (idx % 3) * 18;
                                const tx = Math.round(Math.cos(rad) * dist);
                                const ty = Math.round(Math.sin(rad) * dist);
                                const color = site.sparkColors[idx % site.sparkColors.length];
                                return (
                                    <div
                                        key={idx}
                                        className="absolute w-[3px] h-[3px] rounded-full pointer-events-none opacity-0"
                                        style={{
                                            '--tx': `${tx}px`,
                                            '--ty': `${ty}px`,
                                            backgroundColor: color,
                                            boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
                                            animation: `firework-spark-1 ${site.duration} cubic-bezier(0.12, 0.8, 0.32, 1) infinite ${site.delay}`
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}

                    {/* 新春繁星与空中飘浮火星微粒 */}
                    <div
                        className="absolute inset-0 opacity-80 pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(2px 2px at 60px 45px, #fef08a, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 180px 120px, #f43f5e, rgba(0,0,0,0)), radial-gradient(2px 2px at 340px 70px, #fbbf24, rgba(0,0,0,0)), radial-gradient(2px 2px at 520px 150px, #38bdf8, rgba(0,0,0,0)), radial-gradient(2.5px 2.5px at 700px 90px, #f472b6, rgba(0,0,0,0)), radial-gradient(2px 2px at 860px 130px, #fde047, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 260px 210px, #fed7aa, rgba(0,0,0,0)), radial-gradient(2px 2px at 640px 230px, #fca5a5, rgba(0,0,0,0))',
                            backgroundSize: '900px 450px'
                        }}
                    />

                    {/* 底部宫阙屋脊轮廓剪影 */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-28 opacity-85 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, #0f0205 0%, #20040a 80%, transparent 100%)',
                            clipPath:
                                'polygon(0% 100%, 0% 75%, 4% 70%, 8% 75%, 15% 62%, 22% 76%, 30% 60%, 38% 76%, 48% 54%, 56% 76%, 66% 58%, 74% 76%, 84% 62%, 91% 75%, 96% 69%, 100% 75%, 100% 100%)'
                        }}
                    />
                </div>
            );
        };

        // --- 新增：通用气氛背景层管理器 ---
        // 后续新增商品只需在这里添加 case 即可
        // 仅挂载选中的背景；页面隐藏时暂停装饰动画，保留画布与粒子状态。
        const AtmosphereLayer = ({ type }) => {
            const { isLowPerf, graphicsQuality = 'original', previewBackground = 'current' } = useContext(PerformanceContext);
            type = previewBackground === 'current' ? type : previewBackground === 'none' ? null : previewBackground;
            const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden');
            useEffect(() => {
                const refresh = () => setHidden(document.visibilityState === 'hidden');
                document.addEventListener('visibilitychange', refresh);
                return () => document.removeEventListener('visibilitychange', refresh);
            }, []);
            if (!type) return null;
            return (
                <div className="atmosphere-layer" data-quality={graphicsQuality} data-background={type} data-paused={hidden ? 'true' : undefined}>
                    <style>{`.atmosphere-layer[data-paused="true"], .atmosphere-layer[data-paused="true"] *, .atmosphere-layer[data-paused="true"] *::before, .atmosphere-layer[data-paused="true"] *::after { animation-play-state: paused !important; }`}</style>
                    {type === 'bg_galaxy' && <div className="absolute inset-0"><GalaxyEffect isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_meteor' && <div className="absolute inset-0"><MeteorShower isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_aurora' && <div className="absolute inset-0"><AuroraBorealis isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_lantern' && <div className="absolute inset-0"><LanternFestival isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_firefly' && <div className="absolute inset-0"><FireflyForest isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_ginkgo' && <div className="absolute inset-0"><GinkgoRain isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_matrix' && <div className="absolute inset-0"><MatrixCivilization isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_oraclesands' && <div className="absolute inset-0"><MatrixOracleSands isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_firework' && <div className="absolute inset-0"><LunarFireworks isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_prismatic' && <div className="absolute inset-0"><PrismaticBackground isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_timewarp' && <div className="absolute inset-0"><TimeWarpBackground isActive={true} isLowPerf={isLowPerf} /></div>}
                    {type === 'bg_hyperspeed' && <div className="absolute inset-0"><HyperspeedBackground isActive={true} isLowPerf={isLowPerf} /></div>}
                </div>
            );
        };

export {
    GalaxyEffect, MeteorShower, AuroraWebGL, AuroraBorealis,
    LanternFestival, FireflyForest, GinkgoRain, MatrixCivilization,
    MatrixOracleSands, LunarFireworks, PrismaticBurstWebGL,
    PrismaticBackground, TimeWarpWebGL, TimeWarpBackground,
    HyperspeedWebGL, HyperspeedBackground, AtmosphereLayer
};

export default AtmosphereLayer;
