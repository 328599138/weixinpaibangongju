/**
 * HTML格式化工具
 * 用于美化HTML代码，使其更易于阅读和编辑
 */

const HtmlFormatter = (function() {
    /**
     * 格式化HTML代码
     * @param {string} html - 原始HTML代码
     * @returns {string} - 格式化后的HTML代码
     */
    function format(html) {
        if (!html) return '';
        
        let formatted = '';
        let indent = 0;
        
        // 将HTML标签分解为数组
        const tags = html.replace(/>\s*</g, '>\n<').split('\n');
        
        // 处理每个标签
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i].trim();
            
            // 跳过空行
            if (!tag) continue;
            
            // 检查是否是结束标签
            const isEndTag = tag.startsWith('</');
            
            // 检查是否是自闭合标签
            const isSelfClosingTag = tag.endsWith('/>') || 
                                    /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/.test(tag);
            
            // 对结束标签减少缩进
            if (isEndTag) {
                indent--;
            }
            
            // 添加缩进
            formatted += '  '.repeat(Math.max(0, indent)) + tag + '\n';
            
            // 对开始标签增加缩进
            if (!isEndTag && !isSelfClosingTag) {
                indent++;
            }
        }
        
        return formatted;
    }
    
    /**
     * 压缩HTML代码（移除不必要的空白）
     * @param {string} html - 原始HTML代码
     * @returns {string} - 压缩后的HTML代码
     */
    function minify(html) {
        if (!html) return '';
        
        // 移除HTML注释
        let minified = html.replace(/<!--[\s\S]*?-->/g, '');
        
        // 移除多余的空白
        minified = minified.replace(/>\s+</g, '><');
        
        // 移除标签内的多余空白
        minified = minified.replace(/\s{2,}/g, ' ');
        
        // 移除行首和行尾的空白
        minified = minified.trim();
        
        return minified;
    }
    
    /**
     * 验证HTML代码是否合法
     * @param {string} html - HTML代码
     * @returns {Object} - 验证结果，包含isValid和errors字段
     */
    function validate(html) {
        if (!html) {
            return { isValid: false, errors: ['HTML为空'] };
        }
        
        const errors = [];
        
        // 创建一个临时的DOM解析器
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 检查解析错误
        const parserErrors = doc.querySelectorAll('parsererror');
        if (parserErrors.length > 0) {
            errors.push('HTML解析错误: ' + parserErrors[0].textContent);
        }
        
        // 检查未闭合的标签
        const openTags = [];
        const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        let match;
        
        while ((match = tagPattern.exec(html)) !== null) {
            const fullTag = match[0];
            const tagName = match[1].toLowerCase();
            
            // 忽略自闭合标签
            if (fullTag.endsWith('/>') || 
                ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tagName)) {
                continue;
            }
            
            // 处理开始和结束标签
            if (!fullTag.startsWith('</')) {
                openTags.push(tagName);
            } else {
                if (openTags.length === 0) {
                    errors.push(`多余的结束标签: ${fullTag}`);
                } else if (openTags[openTags.length - 1] !== tagName) {
                    errors.push(`标签未正确闭合: 期望 ${openTags[openTags.length - 1]}，但找到 ${tagName}`);
                }
                openTags.pop();
            }
        }
        
        // 检查是否有未闭合的标签
        if (openTags.length > 0) {
            errors.push(`未闭合的标签: ${openTags.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 修复常见的HTML错误
     * @param {string} html - 原始HTML代码
     * @returns {string} - 修复后的HTML代码
     */
    function fix(html) {
        if (!html) return '';
        
        let fixed = html;
        
        // 修复未闭合的标签
        const openTags = [];
        const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        let match;
        let lastIndex = 0;
        
        while ((match = tagPattern.exec(html)) !== null) {
            const fullTag = match[0];
            const tagName = match[1].toLowerCase();
            
            // 忽略自闭合标签
            if (fullTag.endsWith('/>') || 
                ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tagName)) {
                continue;
            }
            
            // 处理开始和结束标签
            if (!fullTag.startsWith('</')) {
                openTags.push({ name: tagName, index: match.index });
            } else {
                if (openTags.length > 0 && openTags[openTags.length - 1].name === tagName) {
                    openTags.pop();
                }
            }
            
            lastIndex = match.index + fullTag.length;
        }
        
        // 添加缺失的结束标签
        if (openTags.length > 0) {
            let addedTags = '';
            for (let i = openTags.length - 1; i >= 0; i--) {
                addedTags += `</${openTags[i].name}>`;
            }
            fixed = fixed + addedTags;
        }
        
        // 修复常见的HTML实体
        fixed = fixed.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/gi, '&amp;');
        
        return fixed;
    }
    
    // 公开API
    return {
        format,
        minify,
        validate,
        fix
    };
})(); 