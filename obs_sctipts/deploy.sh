#!/bin/bash
rm -rf public         # 清除旧文件
hugo -D --destination public  
cd public
git init
git remote add origin https://github.com/Gavin-gwj/hugo-dev.git
git add .            
git commit -m "deploy"
git branch -M main    
git push -f origin main