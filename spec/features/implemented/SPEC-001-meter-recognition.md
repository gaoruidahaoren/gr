---
id: SPEC-001
title: 智能读表识别
status: implemented
created: 2026-06-25
updated: 2026-06-26
owner: AI Assistant
---

## 概述

用户提供水表照片，通过 AI 多模态能力自动识别水表读数，并将数据保存到云端。支持智谱、百度、OpenAI 等多种 LLM 提供商。

## 契约（Contract）

### 2.1 用户界面契约

| 行为 | 保证 |
|------|------|
| 图片上传 | 支持相册选择和相机拍摄，单次上传一张 |
| 识别过程 | 显示加载状态，最长等待 5 秒 |
| 识别结果 | 显示读数（立方米）和置信度百分比 |
| 结果保存 | 支持确认保存到历史记录 |

### 2.2 数据契约

#### 输入
- 图片文件（支持 jpg/png，最大 5MB）

#### 输出
```typescript
interface RecognitionResult {
  reading: number;      // 水表读数（立方米）
  confidence: number;   // 置信度（0-1）
  success: boolean;      // 是否成功
  message?: string;     // 错误信息
}
```

#### 存储
```typescript
interface MeterRecord {
  _id: string;          // 记录 ID
  _openid: string;      // 用户标识
  imageUrl: string;     // 图片地址
  reading: number;      // 读数
  confidence: number;   // 置信度
  timestamp: number;    // 记录时间
  location?: string;    // 位置备注
  notes?: string;       // 备注信息
  status: 'pending' | 'confirmed' | 'exported';
}
```

### 2.3 错误处理契约

| 错误场景 | 返回 |
|---------|------|
| 网络错误 | `{ success: false, message: '网络错误' }` |
| 识别超时 | `{ success: false, message: '识别超时' }` |
| 图片格式错误 | `{ success: false, message: '不支持的图片格式' }` |
| 识别失败 | `{ success: false, message: '识别失败，请重试' }` |

---

## 验收标准（Acceptance Criteria）

### 3.1 功能验收

- [x] 用户可从相册选择水表照片
- [x] 用户可拍摄水表照片
- [x] 识别过程显示加载动画
- [x] 识别成功显示读数和置信度
- [x] 用户可确认保存识别结果
- [x] 保存后跳转到历史记录页

### 3.2 数据验收

- [x] 记录保存到云数据库 meter_records 集合
- [x] 每条记录关联用户 openid
- [x] 记录包含完整的时间戳

### 3.3 错误处理验收

- [x] 网络错误提示友好错误信息
- [x] 图片加载失败显示占位图
- [x] 识别失败支持重试

---

## 实现锚点（Implementation）

### 4.1 页面

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `src/pages/home/index.tsx` | 上传入口、识别流程 |
| 记录页 | `src/pages/records/index.tsx` | 历史记录列表 |

### 4.2 组件

| 组件 | 文件 | 说明 |
|------|------|------|
| UploadCard | `src/components/UploadCard/index.tsx` | 图片上传卡片 |

### 4.3 服务

| 服务 | 文件 | 说明 |
|------|------|------|
| 识别服务 | `src/services/meter.ts` | 调用识别 API |
| LLM服务 | `src/services/llm.ts` | 多模态LLM调用（支持智谱/百度/OpenAI） |
| 云调用 | `src/services/cloud.ts` | 统一云函数调用 |

### 4.4 配置

| 配置 | 文件 | 说明 |
|------|------|------|
| LLM配置 | `src/config/llm.ts` | API Key、模型、超时等配置 |
| 提示词 | `src/config/prompt.ts` | 识别提示词模板 |

### 4.5 工具

| 工具 | 文件 | 说明 |
|------|------|------|
| 通用工具 | `src/utils/index.ts` | 图片转Base64、格式化等 |

### 4.6 云函数

| 云函数 | 文件 | 说明 |
|--------|------|------|
| createMeterRecord | `cloudfunctions/createMeterRecord/` | 创建记录 |
| getMeterRecords | `cloudfunctions/getMeterRecords/` | 查询记录 |

### 4.7 数据库

| 集合 | 说明 |
|------|------|
| meter_records | 水表读数记录 |

---

## 兼容影响（Compatibility）

### 5.1 当前版本

- 初始版本，无历史兼容问题

### 5.2 未来潜在 Breaking Changes

| 变更 | 影响范围 | 建议 |
|------|---------|------|
| 识别 API 升级 | 识别服务层 | 保持 RecognitionResult 接口稳定 |
| 数据库字段调整 | 记录相关功能 | 通过版本号控制迁移 |

---

## 变更记录

| 日期 | 版本 | 变更内容 | 负责人 |
|------|------|---------|--------|
| 2026-06-25 | 1.0.0 | 初始实现（模拟识别） | AI Assistant |
| 2026-06-26 | 1.1.0 | 升级为真实多模态LLM调用（支持智谱/百度/OpenAI） | AI Assistant |
