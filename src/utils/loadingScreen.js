// ===== Loading 页面控制逻辑（动态平滑过渡） =====
export function initLoadingScreen() {
    if (typeof document === 'undefined') return;

    const loadingScreen = document.getElementById('loading-screen');
    const oracleText1 = document.getElementById('oracle-text-1');
    const oracleText2 = document.getElementById('oracle-text-2');
    
    const colors = ['#cd7f32', '#d4853a', '#da8c42', '#e0954a', '#e69e52', '#eba75a', '#f0b062', '#f5b86a', '#fac172', '#fdc97a', '#ffd182', '#ffd98a', '#ffe192', '#ffe99a', '#fff1a2', '#fff9aa', '#ffffb2', '#ffffba', '#ffffc2', '#ffffca', '#ffffd2', '#ffffda', '#ffffe2', '#ffffea', '#fffff2', '#fffffa', '#FFD700'];
    function lerp(a, b, t) { return a + (b - a) * t; }
    
    // 动态时长：设为 1.2 秒平滑动画，同时支持 App 就绪即刻淡出或点击立即跳过
    const duration = 1200;
    const startTime = Date.now();
    let animId = null;
    let isDismissed = false;
    
    function animate() {
        if (isDismissed) return;
        const elapsed = Date.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const colorIndex = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 1);
        const color = colors[colorIndex];
        const glowIntensity = lerp(0.2, 0.9, t);
        const glowSize1 = lerp(5, 35, t);
        const glowSize2 = lerp(0, 70, Math.max(0, (t - 0.7) / 0.3));
        
        if (oracleText1) {
            oracleText1.style.color = color;
            oracleText1.style.textShadow = glowSize2 > 0 
                ? `0 0 ${glowSize1}px rgba(${lerp(180, 255, t)}, ${lerp(100, 215, t)}, ${lerp(30, 0, t)}, ${glowIntensity}), 0 0 ${glowSize2}px rgba(255, 180, 0, 0.5)`
                : `0 0 ${glowSize1}px rgba(${lerp(180, 255, t)}, ${lerp(100, 215, t)}, ${lerp(30, 0, t)}, ${glowIntensity})`;
        }
        if (oracleText2 && oracleText1) {
            oracleText2.style.color = color;
            oracleText2.style.textShadow = oracleText1.style.textShadow;
        }
        
        if (t < 1) {
            animId = requestAnimationFrame(animate);
        }
    }
    animId = requestAnimationFrame(animate);
    
    function dismiss(minWaitMs = 0) {
        if (isDismissed) return;
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, minWaitMs - elapsed);
        setTimeout(() => {
            if (isDismissed) return;
            isDismissed = true;
            if (animId) cancelAnimationFrame(animId);
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                        loadingScreen.style.visibility = 'hidden';
                    }
                }, 800);
            }
        }, wait);
    }
    
    // 暴露全局手动与自动关闭接口
    if (typeof window !== 'undefined') {
        window.dismissLoadingScreen = (minWait = 500) => dismiss(minWait);
    }
    
    // 点击或触摸屏幕任意处可立即跳过 loading 遮罩
    if (loadingScreen) {
        loadingScreen.style.cursor = 'pointer';
        loadingScreen.addEventListener('click', () => dismiss(0), { once: true });
        loadingScreen.addEventListener('touchend', () => dismiss(0), { once: true });
    }
    
    // 最大兜底超时（1.6秒自动淡出，无需等待原本的 4 秒）
    setTimeout(() => dismiss(0), 1600);
}
