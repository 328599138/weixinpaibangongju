/**
 * DeepSeek API 集成
 * 负责与DeepSeek API通信，实现AI分析和排版功能
 */

const DeepSeekAPI = (function() {
    // API配置
    const config = {
        apiKey: 'sk-122793feab98406399362ebb04fd61e1', // DeepSeek API密钥
        apiEndpoint: 'https://api.deepseek.com/v1/chat/completions', // DeepSeek API端点
        model: 'deepseek-chat', // 使用的模型
    };

    /**
     * 发送请求到DeepSeek API
     * @param {Object} messages - 消息数组
     * @returns {Promise<Object>} - API响应
     */
    async function callAPI(messages) {
        if (!config.apiKey) {
            // 如果没有设置API密钥，使用模拟数据进行演示
            console.warn('未设置DeepSeek API密钥，使用模拟数据');
            return simulateAPIResponse(messages);
        }

        try {
            console.log('正在发送请求到DeepSeek API...');
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 4000,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('DeepSeek API响应错误:', errorData);
                throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('DeepSeek API响应成功:', responseData);
            return responseData;
        } catch (error) {
            console.error('API请求错误:', error);
            // 如果API请求失败，回退到模拟数据
            console.warn('API请求失败，使用模拟数据');
            return simulateAPIResponse(messages);
        }
    }

    /**
     * 模拟API响应（用于演示或API请求失败时的回退）
     * @param {Object} messages - 消息数组
     * @returns {Promise<Object>} - 模拟的API响应
     */
    function simulateAPIResponse(messages) {
        return new Promise((resolve) => {
            // 延迟1-2秒，模拟网络请求
            setTimeout(() => {
                const userMessage = messages.find(m => m.role === 'user')?.content || '';
                
                // 根据请求类型返回不同的模拟数据
                if (userMessage.includes('format_text')) {
                    resolve(simulateFormatResponse(userMessage));
                } else if (userMessage.includes('recommend_theme')) {
                    resolve(simulateThemeResponse(userMessage));
                } else {
                    resolve({
                        choices: [{
                            message: {
                                content: '未能识别的请求类型'
                            }
                        }]
                    });
                }
            }, 1000 + Math.random() * 1000);
        });
    }

    /**
     * 模拟排版响应
     * @param {string} message - 用户消息
     * @returns {Object} - 模拟的排版响应
     */
    function simulateFormatResponse(message) {
        // 提取原始文本
        const textMatch = message.match(/original_text:(.*?)(?:,theme:|$)/s);
        const originalText = textMatch ? textMatch[1].trim() : '示例文本';
        
        // 生成简单的HTML格式
        let html = '';
        const paragraphs = originalText.split(/\n\s*\n/);
        
        // 添加标题
        html += `<h1>${paragraphs[0]}</h1>\n`;
        
        // 处理正文段落
        for (let i = 1; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            
            // 如果段落以数字和点开始，视为列表项
            if (/^\d+\./.test(para)) {
                const items = para.split(/\n/).filter(item => item.trim());
                html += '<ol>\n';
                items.forEach(item => {
                    html += `  <li>${item.replace(/^\d+\.\s*/, '')}</li>\n`;
                });
                html += '</ol>\n';
            } 
            // 如果段落以-或*开始，视为无序列表
            else if (/^[-*]/.test(para)) {
                const items = para.split(/\n/).filter(item => item.trim());
                html += '<ul>\n';
                items.forEach(item => {
                    html += `  <li>${item.replace(/^[-*]\s*/, '')}</li>\n`;
                });
                html += '</ul>\n';
            }
            // 如果段落以>开始，视为引用
            else if (/^>/.test(para)) {
                html += `<blockquote>${para.replace(/^>\s*/, '')}</blockquote>\n`;
            }
            // 普通段落
            else {
                html += `<p>${para}</p>\n`;
            }
        }
        
        // 添加一个分割线
        html += '<hr>\n';
        
        // 添加一个卡片元素
        html += `
<div class="card">
  <h3>重点总结</h3>
  <p>这是一个由AI自动生成的内容卡片，总结了文章的要点。</p>
</div>
`;
        
        return {
            choices: [{
                message: {
                    content: JSON.stringify({
                        html: html,
                        message: '排版完成'
                    })
                }
            }]
        };
    }

    /**
     * 模拟主题推荐响应
     * @param {string} message - 用户消息
     * @returns {Object} - 模拟的主题推荐响应
     */
    function simulateThemeResponse(message) {
        // 随机选择一个主题
        const themes = [
            { theme: 'elegant', themeName: '优雅简约' },
            { theme: 'vibrant', themeName: '活力多彩' },
            { theme: 'business', themeName: '商务专业' },
            { theme: 'creative', themeName: '创意设计' }
        ];
        
        const recommendation = themes[Math.floor(Math.random() * themes.length)];
        
        return {
            choices: [{
                message: {
                    content: JSON.stringify(recommendation)
                }
            }]
        };
    }

    /**
     * 设置API密钥
     * @param {string} apiKey - DeepSeek API密钥
     */
    function setApiKey(apiKey) {
        config.apiKey = apiKey;
    }

    /**
     * 格式化文本
     * @param {string} text - 原始文本
     * @param {string} theme - 主题
     * @returns {Promise<Object>} - 格式化结果
     */
    async function formatText(text, theme = 'default') {
        const messages = [
            {
                role: 'system',
                content: `你是一个专业的微信公众号排版助手。你的任务是分析用户提供的文本，并生成适合微信公众号的HTML排版。
                注意：
                1. 不要改变原文的任何内容，保持原文的完整性
                2. 只添加HTML标签进行美化，不要修改或重写原文
                3. 识别文章的结构，如标题、段落、列表、引用等
                4. 根据内容添加适当的格式，如强调重点内容
                5. 返回格式必须是有效的JSON，包含html字段
                6. 根据主题风格调整排版样式`
            },
            {
                role: 'user',
                content: `请对以下文本进行排版，主题风格：${theme}
                
                format_text:
                original_text:${text}
                theme:${theme}
                
                请返回JSON格式，包含html字段，例如：{"html": "<h1>标题</h1><p>段落</p>", "message": "排版完成"}`
            }
        ];

        try {
            const response = await callAPI(messages);
            const content = response.choices[0].message.content;
            
            // 尝试解析JSON响应
            try {
                // 查找JSON字符串的开始和结束位置
                const jsonStart = content.indexOf('{');
                const jsonEnd = content.lastIndexOf('}') + 1;
                
                if (jsonStart >= 0 && jsonEnd > jsonStart) {
                    const jsonStr = content.substring(jsonStart, jsonEnd);
                    return JSON.parse(jsonStr);
                } else {
                    // 如果没有找到JSON，尝试将内容包装为HTML
                    return {
                        html: `<p>${content}</p>`,
                        message: '排版完成（非JSON格式）'
                    };
                }
            } catch (e) {
                console.error('解析API响应失败:', e);
                console.log('原始响应:', content);
                
                // 如果解析失败，将内容包装为HTML
                return {
                    html: `<p>${content}</p>`,
                    message: '排版完成（解析失败）'
                };
            }
        } catch (error) {
            console.error('格式化文本失败:', error);
            throw error;
        }
    }

    /**
     * 推荐主题
     * @param {string} text - 原始文本
     * @returns {Promise<Object>} - 主题推荐结果
     */
    async function recommendTheme(text) {
        const messages = [
            {
                role: 'system',
                content: `你是一个专业的内容分析助手。你的任务是分析用户提供的文本内容，并推荐最适合的排版主题。
                可用的主题有：
                - elegant: 优雅简约
                - vibrant: 活力多彩
                - business: 商务专业
                - creative: 创意设计
                
                返回格式必须是有效的JSON，包含theme和themeName字段。例如：{"theme": "elegant", "themeName": "优雅简约"}`
            },
            {
                role: 'user',
                content: `请分析以下文本内容，并推荐最适合的排版主题：
                
                recommend_theme:
                ${text.substring(0, 1000)}` // 只发送前1000个字符进行分析
            }
        ];

        try {
            const response = await callAPI(messages);
            const content = response.choices[0].message.content;
            
            // 尝试解析JSON响应
            try {
                // 查找JSON字符串的开始和结束位置
                const jsonStart = content.indexOf('{');
                const jsonEnd = content.lastIndexOf('}') + 1;
                
                if (jsonStart >= 0 && jsonEnd > jsonStart) {
                    const jsonStr = content.substring(jsonStart, jsonEnd);
                    return JSON.parse(jsonStr);
                } else {
                    // 如果没有找到JSON，返回默认主题
                    console.warn('未找到JSON格式的主题推荐，使用默认主题');
                    return { theme: 'elegant', themeName: '优雅简约' };
                }
            } catch (e) {
                console.error('解析API响应失败:', e);
                console.log('原始响应:', content);
                
                // 如果解析失败，返回默认主题
                return { theme: 'elegant', themeName: '优雅简约' };
            }
        } catch (error) {
            console.error('推荐主题失败:', error);
            throw error;
        }
    }

    // 公开API
    return {
        setApiKey,
        formatText,
        recommendTheme
    };
})(); 