/**
 * 微信公众号排版工具 - 主脚本
 * 负责处理用户交互、UI更新和功能协调
 */

// 全局变量
let htmlEditor; // CodeMirror编辑器实例
let currentTheme = 'default'; // 当前主题
let formattedHtml = ''; // 当前格式化后的HTML
let isEditing = false; // 是否处于HTML编辑模式

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化HTML编辑器
    initHtmlEditor();
    
    // 初始化事件监听
    initEventListeners();
    
    // 初始化字符计数
    updateCharCount();
    
    // 应用默认主题
    applyTheme('default');
    
    console.log('微信公众号排版工具初始化完成');
});

/**
 * 初始化HTML编辑器
 */
function initHtmlEditor() {
    const editorContainer = document.getElementById('html-editor-container');
    
    htmlEditor = CodeMirror(editorContainer, {
        mode: 'htmlmixed',
        theme: 'material',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        extraKeys: {
            'Ctrl-Space': 'autocomplete'
        }
    });
    
    // 编辑器内容变化时更新按钮状态
    htmlEditor.on('change', () => {
        document.getElementById('update-preview-btn').disabled = false;
    });
}

/**
 * 初始化事件监听
 */
function initEventListeners() {
    // 文本输入区字符计数
    document.getElementById('original-text').addEventListener('input', updateCharCount);
    
    // AI排版按钮
    document.getElementById('format-btn').addEventListener('click', formatText);
    
    // AI推荐主题按钮
    document.getElementById('ai-theme-btn').addEventListener('click', recommendTheme);
    
    // 更新预览按钮
    document.getElementById('update-preview-btn').addEventListener('click', updatePreviewFromEditor);
    
    // 复制到微信按钮
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    
    // 加载示例按钮
    document.getElementById('load-example').addEventListener('click', loadExample);
    
    // 清空按钮
    document.getElementById('clear-text').addEventListener('click', clearText);
    
    // 主题选择下拉框
    document.getElementById('theme-select').addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
    
    // 保存模板按钮
    document.getElementById('save-template-btn').addEventListener('click', () => {
        document.getElementById('save-template-modal').classList.add('show');
        document.getElementById('save-template-modal').style.display = 'block';
    });
    
    // 确认保存模板按钮
    document.getElementById('confirm-save-template').addEventListener('click', saveTemplate);
    
    // 标签页切换事件
    document.getElementById('html-tab').addEventListener('click', () => {
        if (formattedHtml && !isEditing) {
            htmlEditor.setValue(HtmlFormatter.format(formattedHtml));
            isEditing = true;
        }
    });
}

/**
 * 更新字符计数
 */
function updateCharCount() {
    const text = document.getElementById('original-text').value;
    const count = text.length;
    document.getElementById('char-count').textContent = `${count} 字符`;
}

/**
 * 应用主题
 * @param {string} theme - 主题名称
 */
function applyTheme(theme) {
    // 移除之前的主题类
    document.getElementById('preview-content').classList.remove(`theme-${currentTheme}`);
    document.getElementById('mobile-content').classList.remove(`theme-${currentTheme}`);
    
    // 添加新主题类
    document.getElementById('preview-content').classList.add(`theme-${theme}`);
    document.getElementById('mobile-content').classList.add(`theme-${theme}`);
    
    // 更新当前主题
    currentTheme = theme;
    document.getElementById('theme-select').value = theme;
    
    // 如果已有格式化内容，重新应用主题
    if (formattedHtml) {
        updatePreview(formattedHtml);
    }
    
    console.log(`已应用主题: ${theme}`);
}

/**
 * 格式化文本
 */
async function formatText() {
    const originalText = document.getElementById('original-text').value.trim();
    
    // 检查是否有文本
    if (!originalText) {
        alert('请输入需要排版的文本');
        return;
    }
    
    try {
        // 显示加载遮罩
        document.getElementById('loading-overlay').classList.remove('d-none');
        
        // 调用DeepSeek API进行排版
        const formattedResult = await DeepSeekAPI.formatText(originalText, currentTheme);
        
        // 更新预览
        formattedHtml = formattedResult.html;
        updatePreview(formattedHtml);
        
        // 启用复制和保存按钮
        document.getElementById('copy-btn').disabled = false;
        document.getElementById('save-template-btn').disabled = false;
        
        // 重置编辑状态
        isEditing = false;
        
    } catch (error) {
        console.error('排版失败:', error);
        alert(`排版失败: ${error.message || '未知错误'}`);
    } finally {
        // 隐藏加载遮罩
        document.getElementById('loading-overlay').classList.add('d-none');
    }
}

/**
 * 推荐主题
 */
async function recommendTheme() {
    const originalText = document.getElementById('original-text').value.trim();
    
    // 检查是否有文本
    if (!originalText) {
        alert('请输入文本以获取主题推荐');
        return;
    }
    
    try {
        // 显示加载遮罩
        document.getElementById('loading-overlay').classList.remove('d-none');
        
        // 调用DeepSeek API获取主题推荐
        const recommendation = await DeepSeekAPI.recommendTheme(originalText);
        
        // 应用推荐的主题
        applyTheme(recommendation.theme);
        
        // 启用AI推荐主题选项
        const themeSelect = document.getElementById('theme-select');
        const aiOption = themeSelect.querySelector('option[value="ai-recommended"]');
        aiOption.disabled = false;
        aiOption.textContent = `AI推荐: ${recommendation.themeName}`;
        aiOption.value = recommendation.theme;
        themeSelect.value = recommendation.theme;
        
    } catch (error) {
        console.error('主题推荐失败:', error);
        alert(`主题推荐失败: ${error.message || '未知错误'}`);
    } finally {
        // 隐藏加载遮罩
        document.getElementById('loading-overlay').classList.add('d-none');
    }
}

/**
 * 从编辑器更新预览
 */
function updatePreviewFromEditor() {
    const html = htmlEditor.getValue();
    formattedHtml = html;
    updatePreview(html);
    document.getElementById('update-preview-btn').disabled = true;
}

/**
 * 更新预览内容
 * @param {string} html - 格式化后的HTML
 */
function updatePreview(html) {
    // 更新预览区
    document.getElementById('preview-content').innerHTML = `<div class="wx-format">${html}</div>`;
    
    // 更新手机预览区
    document.getElementById('mobile-content').innerHTML = `<div class="wx-format">${html}</div>`;
    
    // 如果当前在HTML编辑标签页，更新编辑器内容
    if (document.getElementById('html-tab').classList.contains('active')) {
        htmlEditor.setValue(HtmlFormatter.format(html));
    }
}

/**
 * 复制到剪贴板
 */
function copyToClipboard() {
    if (!formattedHtml) {
        alert('没有可复制的内容');
        return;
    }
    
    try {
        // 使用剪贴板工具复制HTML内容
        ClipboardUtil.copyHtml(formattedHtml);
        
        // 显示成功提示
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        
        // 3秒后恢复按钮文本
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 3000);
        
    } catch (error) {
        console.error('复制失败:', error);
        alert(`复制失败: ${error.message || '未知错误'}`);
    }
}

/**
 * 加载示例文本
 */
function loadExample() {
    // 从examples.js获取随机示例
    const example = Examples.getRandomExample();
    document.getElementById('original-text').value = example.text;
    updateCharCount();
}

/**
 * 清空文本
 */
function clearText() {
    document.getElementById('original-text').value = '';
    updateCharCount();
}

/**
 * 保存模板
 */
function saveTemplate() {
    const name = document.getElementById('template-name').value.trim();
    const description = document.getElementById('template-description').value.trim();
    
    if (!name) {
        alert('请输入模板名称');
        return;
    }
    
    if (!formattedHtml) {
        alert('没有可保存的内容');
        return;
    }
    
    try {
        // 保存模板
        Templates.saveTemplate({
            name,
            description,
            html: formattedHtml,
            theme: currentTheme,
            timestamp: new Date().toISOString()
        });
        
        // 关闭模态框
        const modal = document.getElementById('save-template-modal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // 清空输入
        document.getElementById('template-name').value = '';
        document.getElementById('template-description').value = '';
        
        // 显示成功提示
        alert('模板保存成功');
        
    } catch (error) {
        console.error('保存模板失败:', error);
        alert(`保存模板失败: ${error.message || '未知错误'}`);
    }
} 