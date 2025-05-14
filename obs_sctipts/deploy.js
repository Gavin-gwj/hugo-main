module.exports = async () => {
    const { exec } = require('child_process');
    const scriptPath = "/D/Software/hugo/dev/obs_sctipts/deploy.sh";
    
    try {
        exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                new Notice('❌ 部署失败！请检查控制台日志。');
                return;
            }
            console.log('部署成功:', stdout);
            new Notice('✅ Hugo 部署完成！');
        });
    } catch (err) {
        console.error('脚本执行异常:', err);
        new Notice('❌ 脚本执行出错！');
    }
};