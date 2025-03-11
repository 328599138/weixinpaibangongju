# 微信公众号排版工具

这是一个强大的微信公众号排版工具，可以将普通文本转换为精美的微信排版格式，生成丰富多样的排版效果，包括标题、引用、列表、分割线、卡片等元素，并且在微信中显示效果良好。

## 功能特点

1. **双区域界面**：左侧是原始文本输入区，右侧是排版预览区
2. **AI智能排版**：利用DeepSeek API分析文本内容，自动进行排版美化，保持原文内容不变
3. **一键复制**：支持一键复制功能，确保复制到微信后保留所有排版格式
4. **AI主题推荐**：根据文章内容自动匹配适合的主题和颜色
5. **手机预览**：支持查看在手机上的显示效果
6. **HTML编辑**：支持手动调整HTML排版代码

## 技术实现

- HTML、CSS和JavaScript
- Bootstrap框架实现响应式布局
- CodeMirror实现HTML编辑器
- DeepSeek API进行AI分析和排版
- 跨浏览器剪贴板功能

## 使用方法

1. **输入文本**：在左侧输入区粘贴或输入需要排版的原始文本
2. **AI排版**：点击"AI排版"按钮，系统会自动分析文本并生成排版
3. **选择主题**：可以选择预设主题或使用AI推荐的主题
4. **预览效果**：在右侧预览区查看排版效果，可切换到手机预览模式
5. **调整HTML**：点击"编辑HTML"可以手动调整排版代码
6. **复制到微信**：点击"复制到微信"按钮，然后粘贴到微信公众号编辑器中

## 文件结构

- `index.html` - 主界面
- `styles.css` - 样式表
- `script.js` - 主脚本
- `deepseek-api.js` - DeepSeek API集成
- `html-formatter.js` - HTML格式化工具
- `clipboard.js` - 剪贴板增强工具
- `templates.js` - 排版模板
- `examples.js` - 示例文本

## DeepSeek API配置

本工具使用DeepSeek API进行文本分析和排版。当前已配置了API密钥，可以直接使用。如需更换为自己的API密钥，请按以下步骤操作：

1. 访问 [DeepSeek API官网](https://api-docs.deepseek.com/zh-cn/) 注册并获取API密钥
2. 打开 `deepseek-api.js` 文件
3. 找到 `apiKey` 配置项，替换为你自己的API密钥

```javascript
const config = {
    apiKey: '你的API密钥', // 替换为你的DeepSeek API密钥
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
};
```

## 注意事项

- AI排版时保持原文内容一字不差，只添加HTML标签进行美化，不修改或重写原文
- 复制到微信时，部分复杂样式可能需要在微信编辑器中进行微调
- 建议使用Chrome、Firefox、Edge等现代浏览器获得最佳体验
- 如果API请求失败，系统会自动回退到模拟数据进行演示 