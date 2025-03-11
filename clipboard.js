/**
 * 剪贴板增强工具
 * 用于处理HTML内容的复制，确保在微信中保留格式
 */

const ClipboardUtil = (function() {
    /**
     * 复制HTML内容到剪贴板
     * @param {string} html - 要复制的HTML内容
     * @returns {boolean} - 是否复制成功
     */
    function copyHtml(html) {
        if (!html) {
            console.error('没有可复制的内容');
            return false;
        }
        
        try {
            // 创建一个临时的div元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.setAttribute('contenteditable', 'true');
            document.body.appendChild(tempDiv);
            
            // 选择临时元素中的内容
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // 执行复制命令
            const successful = document.execCommand('copy');
            
            // 清理
            selection.removeAllRanges();
            document.body.removeChild(tempDiv);
            
            if (!successful) {
                throw new Error('复制命令执行失败');
            }
            
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            
            // 尝试使用现代Clipboard API作为备选方案
            return fallbackClipboardAPI(html);
        }
    }
    
    /**
     * 使用现代Clipboard API作为备选方案
     * @param {string} html - 要复制的HTML内容
     * @returns {boolean} - 是否复制成功
     */
    async function fallbackClipboardAPI(html) {
        if (!navigator.clipboard || !navigator.clipboard.write) {
            console.error('当前浏览器不支持Clipboard API');
            return false;
        }
        
        try {
            // 创建一个包含HTML和文本的剪贴板项
            const type = 'text/html';
            const blob = new Blob([html], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            
            // 写入剪贴板
            await navigator.clipboard.write(data);
            return true;
        } catch (err) {
            console.error('Clipboard API复制失败:', err);
            
            // 最后尝试只复制文本内容
            return copyTextOnly(html);
        }
    }
    
    /**
     * 仅复制文本内容（移除HTML标签）
     * @param {string} html - 包含HTML标签的内容
     * @returns {boolean} - 是否复制成功
     */
    async function copyTextOnly(html) {
        try {
            // 创建临时元素提取纯文本
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const textOnly = tempDiv.textContent || tempDiv.innerText || '';
            
            // 使用Clipboard API复制纯文本
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textOnly);
                console.warn('已复制纯文本内容（HTML格式未保留）');
                return true;
            }
            
            // 使用document.execCommand作为备选
            const textArea = document.createElement('textarea');
            textArea.value = textOnly;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                console.warn('已复制纯文本内容（HTML格式未保留）');
            }
            
            return successful;
        } catch (err) {
            console.error('文本复制失败:', err);
            return false;
        }
    }
    
    /**
     * 检测浏览器对HTML复制的支持情况
     * @returns {Object} - 支持情况
     */
    function checkSupport() {
        return {
            execCommand: typeof document.execCommand === 'function',
            clipboardAPI: !!(navigator.clipboard && navigator.clipboard.write),
            clipboardEvent: 'ClipboardEvent' in window,
            clipboardData: 'clipboardData' in window || ('clipboard' in window && 'ClipboardItem' in window)
        };
    }
    
    /**
     * 优化HTML以便在微信中更好地显示
     * @param {string} html - 原始HTML
     * @returns {string} - 优化后的HTML
     */
    function optimizeForWeChat(html) {
        if (!html) return '';
        
        let optimized = html;
        
        // 替换一些微信不支持的标签和属性
        optimized = optimized.replace(/<(script|iframe|embed|object|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
        
        // 移除可能导致问题的属性
        optimized = optimized.replace(/ on\w+="[^"]*"/gi, '');
        optimized = optimized.replace(/ style="[^"]*position\s*:[^;]*;?/gi, ' style="');
        
        // 确保图片有alt属性
        optimized = optimized.replace(/<img([^>]*)>/gi, function(match, attributes) {
            if (!/ alt=/.test(attributes)) {
                return `<img${attributes} alt="图片">`;
            }
            return match;
        });
        
        return optimized;
    }
    
    // 公开API
    return {
        copyHtml,
        optimizeForWeChat,
        checkSupport
    };
})(); 