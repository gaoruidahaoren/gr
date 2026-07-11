# 🚀 Vercel 部署指南

## 项目信息
- **项目名称**: 智能读表
- **技术栈**: Taro + React + TypeScript
- **部署平台**: Vercel

## 📋 部署步骤

### 方式一：通过 GitHub 部署（推荐）

#### 1. 创建 GitHub 仓库
```bash
# 在项目根目录执行
git init
git add .
git commit -m "智能读表小程序"
git remote add origin https://github.com/your-username/smart-meter-reader.git
git push -u origin main
```

#### 2. 登录 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"

#### 3. 导入项目
1. 选择 "Import Git Repository"
2. 选择刚创建的仓库
3. 配置项目设置：
   - **Framework Preset**: Other
   - **Build Command**: `NODE_ENV=production npm run build:h5`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

#### 4. 部署
点击 "Deploy" 按钮，等待部署完成。

---

### 方式二：通过 Vercel CLI 部署

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署项目
```bash
# 在项目根目录执行
vercel --prod
```

---

## 🔧 配置说明

### vercel.json 配置
```json
{
  "version": 2,
  "name": "smart-meter-reader",
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 环境变量（可选）
如果需要配置 API Key，可以在 Vercel 控制台设置环境变量：
- `VITE_API_KEY`: 通义千问 API Key

---

## 📱 功能说明

### H5 版本功能
- ✅ 图片上传和识别
- ✅ 本地存储（localStorage）
- ✅ Excel 导出
- ✅ 计算功能
- ✅ 响应式设计

### 限制说明
- ❌ 微信登录（需要小程序环境）
- ❌ 云开发（需要微信云环境）
- ❌ 相机拍照（H5 环境限制）

---

## 🎯 访问地址

部署成功后，您将获得一个类似以下的访问链接：
```
https://smart-meter-reader.vercel.app
```

---

## 🔄 更新部署

每次推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署。

手动触发部署：
```bash
vercel --prod
```

---

## 🐛 常见问题

### Q: 图片上传失败？
A: H5 环境使用浏览器的文件选择器，确保图片格式正确。

### Q: 数据丢失？
A: 数据存储在浏览器本地，清除缓存会丢失数据。建议定期导出 Excel 备份。

### Q: 如何自定义域名？
A: 在 Vercel 控制台的 Settings → Domains 中添加您的域名。

---

## 📞 技术支持

如有问题，请查看：
- Vercel 文档: https://vercel.com/docs
- Taro 文档: https://taro.zone/docs
