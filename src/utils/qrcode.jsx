import React from 'react';
import QRCode from 'qrcode';

// 内存高速缓存，避免相同内容重复计算
const qrCache = new Map();

/**
 * 纯离线高性能生成二维码 Data URL
 * @param {string} text - 目标文本/链接
 * @param {object} options - QRCode 选项（宽度、边距、颜色等）
 * @returns {Promise<string>} base64 data URL
 */
export const getQRCodeDataUrl = async (text, options = {}) => {
    if (!text) return '';
    const cacheKey = text + JSON.stringify(options);
    if (qrCache.has(cacheKey)) return qrCache.get(cacheKey);

    try {
        const url = await QRCode.toDataURL(text, {
            width: options.width || 260,
            margin: options.margin !== undefined ? options.margin : 2,
            color: options.color || { dark: '#0f172a', light: '#ffffff' },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M'
        });
        qrCache.set(cacheKey, url);
        return url;
    } catch (err) {
        console.error('[QRCode] Local generation failed:', err);
        return '';
    }
};

/**
 * 通用纯前端离线二维码展示组件
 * 彻底替换失效的第三方国外服务 api.qrserver.com，国内手机端 100% 秒现
 */
export const QRCodeView = ({ text, alt = '二维码', className = 'w-44 h-44 rounded-xl', options = {} }) => {
    const [dataUrl, setDataUrl] = React.useState('');

    React.useEffect(() => {
        let active = true;
        if (!text) {
            setDataUrl('');
            return;
        }
        getQRCodeDataUrl(text, options).then(url => {
            if (active) setDataUrl(url);
        });
        return () => { active = false; };
    }, [text, JSON.stringify(options)]);

    if (!dataUrl) {
        return (
            <div className={`${className} bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse`}>
                二维码生成中...
            </div>
        );
    }

    return <img src={dataUrl} alt={alt} className={className} />;
};
