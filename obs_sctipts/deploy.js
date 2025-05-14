const { exec } = require('child_process');

// 方法1：直接使用绝对路径（推荐）
const scriptPath = "D:\\Software\\hugo\\dev\\obs_scripts\\deploy.sh"; // Windows 路径
// 或（Git Bash 风格）
// const scriptPath = "/d/Software/hugo/dev/obs_scripts/deploy.sh";

exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
        console.error('Error:', error);
        new Notice('❌ 部署失败！请检查控制台日志。');
        return;
    }
    console.log('部署成功:', stdout);
    new Notice('✅ Hugo 部署完成！');
});