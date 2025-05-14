const util = require('util');
const child_process = require('child_process');
const fs = require('fs/promises');
const path = require('path');

const exec = util.promisify(child_process.exec);

// 补零函数
function pad(num) {
    return num.toString().padStart(2, '0');
}

// 生成ISO格式当前时间（带时区）
function getCurrentISODate() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+08:00`;
}

// 生成时间戳文件夹名称
function getTimeStamp() {
    const d = new Date();
    return [
        d.getFullYear(), '-',
        pad(d.getMonth() + 1), '-',
        pad(d.getDate()), '_',
        pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())
    ].join('');
}

async function executeCommand() {
    try {
        const hugoRoot = "D:/Software/hugo/dev";
        const folderName = getTimeStamp();
        const postDir = path.join(hugoRoot, "content/post", folderName);
        const imagesDir = path.join(postDir, "images");
        
        // 读取外部模板文件
        const templatePath = path.join(hugoRoot, "archetypes/default.md");
        let template = await fs.readFile(templatePath, 'utf-8');
        
        // 替换模板变量（兼容Hugo archetypes语法）
        const currentDate = getCurrentISODate();
        template = template
            .replace(/{{(\s*\.Date\s*)}}/g, currentDate)  // 匹配{{ .Date }}
            .replace(/{{(\s*now.Format "2006-01-02T15:04:05-07:00"\s*)}}/g, currentDate); // 匹配复杂格式

        // 创建目录结构
        await fs.mkdir(postDir, { recursive: true });
        await fs.mkdir(imagesDir);

        // 写入文章文件
        const indexPath = path.join(postDir, "index.md");
        await fs.writeFile(indexPath, template, 'utf-8');

        
        // 等待文件加载完成
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        // 执行打开操作
        app.workspace.getLeaf(true).openFile(file);
        app.commands.executeCommandById('obsidian-front-matter:open');

        new Notice(`创建成功！目录：${folderName}`);

    } catch (error) {
        console.error('[Error]', error);
        new Notice(`创建失败：${error.message}`);
    }
}

module.exports = async function() {
    await executeCommand();
};
