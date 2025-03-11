/**
 * 排版模板管理
 * 负责存储、加载和应用排版模板
 */

const Templates = (function() {
    // 本地存储键名
    const STORAGE_KEY = 'wx_format_templates';
    
    // 默认模板
    const DEFAULT_TEMPLATES = [
        {
            id: 'default-1',
            name: '标准文章',
            description: '适合一般文章的标准排版',
            theme: 'default',
            timestamp: new Date().toISOString(),
            html: `
<h1>文章标题</h1>
<p>这是文章的导语，简要介绍文章的主要内容和目的。</p>
<h2>第一部分</h2>
<p>这是第一部分的正文内容，可以包含多个段落。</p>
<p>这是另一个段落，继续阐述第一部分的内容。</p>
<h2>第二部分</h2>
<p>这是第二部分的正文内容。</p>
<blockquote>这是一段引用文字，可以用来强调重要的观点或引用他人的话。</blockquote>
<h3>小节标题</h3>
<p>这是小节的内容。</p>
<ul>
  <li>列表项一</li>
  <li>列表项二</li>
  <li>列表项三</li>
</ul>
<h2>总结</h2>
<p>这是文章的总结部分，回顾主要观点并给出结论。</p>
<div class="card">
  <h3>延伸阅读</h3>
  <p>这里可以放置相关文章的链接或推荐阅读。</p>
</div>
`
        },
        {
            id: 'default-2',
            name: '产品介绍',
            description: '适合产品介绍和推广的排版',
            theme: 'business',
            timestamp: new Date().toISOString(),
            html: `
<h1>产品名称</h1>
<p class="text-center">——解决您的核心需求——</p>
<h2>产品概述</h2>
<p>简要介绍产品的核心功能和主要特点。</p>
<div class="image-container">
  <img src="https://via.placeholder.com/600x300" alt="产品图片">
  <p class="caption">产品效果展示</p>
</div>
<h2>核心优势</h2>
<ol>
  <li><strong>优势一</strong>：详细说明优势一的具体内容。</li>
  <li><strong>优势二</strong>：详细说明优势二的具体内容。</li>
  <li><strong>优势三</strong>：详细说明优势三的具体内容。</li>
</ol>
<h2>功能特点</h2>
<p>详细介绍产品的功能特点。</p>
<h3>功能一</h3>
<p>功能一的详细说明。</p>
<h3>功能二</h3>
<p>功能二的详细说明。</p>
<blockquote>用户反馈：这个功能真的解决了我的大问题！</blockquote>
<h2>如何获取</h2>
<p>介绍产品的获取方式、价格等信息。</p>
<div class="card">
  <h3>限时优惠</h3>
  <p>现在购买享受八折优惠，优惠码：<span class="highlight">PROMO20</span></p>
</div>
<p class="text-center">欢迎联系我们了解更多详情</p>
`
        },
        {
            id: 'default-3',
            name: '活动通知',
            description: '适合活动通知和邀请函的排版',
            theme: 'vibrant',
            timestamp: new Date().toISOString(),
            html: `
<h1 class="text-center">活动名称</h1>
<p class="text-center">诚挚邀请您参加</p>
<hr>
<h2>活动详情</h2>
<ul>
  <li><strong>时间</strong>：2023年X月X日 14:00-17:00</li>
  <li><strong>地点</strong>：城市名称 详细地址</li>
  <li><strong>主题</strong>：活动主题描述</li>
  <li><strong>对象</strong>：适合参加的人群</li>
</ul>
<h2>活动亮点</h2>
<p>详细介绍本次活动的亮点和参与者可以获得的价值。</p>
<div class="image-container">
  <img src="https://via.placeholder.com/600x300" alt="活动海报">
</div>
<h2>活动流程</h2>
<ol>
  <li>14:00-14:30 签到</li>
  <li>14:30-15:30 主题分享</li>
  <li>15:30-16:00 互动环节</li>
  <li>16:00-17:00 自由交流</li>
</ol>
<h2>报名方式</h2>
<p>介绍如何报名参加活动。</p>
<div class="card">
  <h3>特别提示</h3>
  <p>请提前报名，现场名额有限！</p>
</div>
<p class="text-center">期待您的参与！</p>
`
        }
    ];
    
    /**
     * 获取所有模板
     * @returns {Array} - 模板数组
     */
    function getAllTemplates() {
        try {
            // 从本地存储获取模板
            const storedTemplates = localStorage.getItem(STORAGE_KEY);
            let templates = storedTemplates ? JSON.parse(storedTemplates) : [];
            
            // 如果没有模板，使用默认模板
            if (!templates || templates.length === 0) {
                templates = DEFAULT_TEMPLATES;
                // 保存默认模板到本地存储
                localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            }
            
            return templates;
        } catch (error) {
            console.error('获取模板失败:', error);
            return DEFAULT_TEMPLATES;
        }
    }
    
    /**
     * 获取模板
     * @param {string} id - 模板ID
     * @returns {Object|null} - 模板对象或null
     */
    function getTemplate(id) {
        const templates = getAllTemplates();
        return templates.find(template => template.id === id) || null;
    }
    
    /**
     * 保存模板
     * @param {Object} template - 模板对象
     * @returns {string} - 模板ID
     */
    function saveTemplate(template) {
        try {
            const templates = getAllTemplates();
            
            // 生成唯一ID
            const id = template.id || `template-${Date.now()}`;
            
            // 创建新模板对象
            const newTemplate = {
                ...template,
                id,
                timestamp: new Date().toISOString()
            };
            
            // 检查是否已存在同ID模板
            const existingIndex = templates.findIndex(t => t.id === id);
            if (existingIndex >= 0) {
                // 更新现有模板
                templates[existingIndex] = newTemplate;
            } else {
                // 添加新模板
                templates.push(newTemplate);
            }
            
            // 保存到本地存储
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            
            return id;
        } catch (error) {
            console.error('保存模板失败:', error);
            throw new Error('保存模板失败');
        }
    }
    
    /**
     * 删除模板
     * @param {string} id - 模板ID
     * @returns {boolean} - 是否删除成功
     */
    function deleteTemplate(id) {
        try {
            // 不允许删除默认模板
            if (id.startsWith('default-')) {
                console.warn('不能删除默认模板');
                return false;
            }
            
            const templates = getAllTemplates();
            const filteredTemplates = templates.filter(template => template.id !== id);
            
            // 如果长度相同，说明没有找到要删除的模板
            if (filteredTemplates.length === templates.length) {
                return false;
            }
            
            // 保存到本地存储
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
            
            return true;
        } catch (error) {
            console.error('删除模板失败:', error);
            return false;
        }
    }
    
    /**
     * 应用模板到文本
     * @param {string} templateId - 模板ID
     * @param {string} text - 原始文本
     * @returns {string} - 应用模板后的HTML
     */
    function applyTemplate(templateId, text) {
        const template = getTemplate(templateId);
        if (!template) {
            console.error('模板不存在:', templateId);
            return '';
        }
        
        // 简单的模板应用逻辑
        // 这里只是一个示例，实际应用中可能需要更复杂的逻辑
        let html = template.html;
        
        // 分割文本为段落
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
        
        // 替换标题
        if (paragraphs.length > 0) {
            html = html.replace(/<h1>.*?<\/h1>/, `<h1>${paragraphs[0]}</h1>`);
        }
        
        // 替换正文内容
        let contentHtml = '';
        for (let i = 1; i < paragraphs.length; i++) {
            contentHtml += `<p>${paragraphs[i]}</p>\n`;
        }
        
        // 替换模板中的示例段落
        html = html.replace(/<p>这是.*?<\/p>/, contentHtml);
        
        return html;
    }
    
    /**
     * 获取随机模板
     * @returns {Object} - 随机模板
     */
    function getRandomTemplate() {
        const templates = getAllTemplates();
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }
    
    // 公开API
    return {
        getAllTemplates,
        getTemplate,
        saveTemplate,
        deleteTemplate,
        applyTemplate,
        getRandomTemplate
    };
})(); 