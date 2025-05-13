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

// 新模板内容（已移除标签和系列）
const templateContent = (date) => 
    `---
title: "标题"                         
author: "歌未竟"  
description : "这是描述信息"    
date: 2025-05-12        
            

tags : [                                    
"tag",
]
categories : [                              
"标签",
]

---
<!--more-->`;

async function executeCommand() {
    try {
        const hugoRoot = "D:/Software/hugo/dev";
        const folderName = getTimeStamp(); // 使用时间戳命名文件夹
        const postDir = path.join(hugoRoot, "content/post", folderName);
        const imagesDir = path.join(postDir, "images"); // 图片目录

        // 创建文件夹结构
        await fs.mkdir(postDir, { recursive: true });
        await fs.mkdir(imagesDir);

        // 生成动态模板内容
        const currentDate = getCurrentISODate();
        const mdContent = templateContent(currentDate);

        // 写入index.md
        const indexPath = path.join(postDir, "index.md");
        await fs.writeFile(indexPath, mdContent, 'utf-8');

        new Notice(`创建成功！目录：${folderName}`);

        // 自动打开文件
        const vaultPath = `content/post/${folderName}/index.md`;
        app.workspace.openLinkText(vaultPath, '', false);

    } catch (error) {
        console.error('[Error]', error);
        new Notice(`创建失败：${error.message}`);
    }
}

module.exports = async function() {
    await executeCommand();
};