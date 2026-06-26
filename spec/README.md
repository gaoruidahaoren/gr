# Spec 状态账本

> 本目录维护智能读表小程序的所有行为规范，按状态分类管理。

## 目录结构

```
spec/
├── README.md          # 本文件 - 状态账本总览
├── governance/        # 治理文档
│   └── README.md
└── features/         # 功能规范
    ├── planned/      # 已规划
    ├── implemented/  # 已实现
    └── archived/     # 已归档
```

---

## Spec 状态定义

### governance（治理）
- **定义**：项目治理规范文档
- **内容**：开发流程、质量标准、协作规范
- **转移**：永不转移

### planned（已规划）
- **定义**：已纳入开发计划但尚未实现的功能
- **内容**：需求描述、设计方案、验收标准
- **转移条件**：
  - 代码实现完成
  - 测试通过
  - 代码审查通过

### implemented（已实现）
- **定义**：已完成开发并通过验收的功能
- **内容**：实现锚点、验收证据、兼容说明
- **转移条件**：
  - 功能被废弃或替代
  - 重大版本迭代归档

### archived（已归档）
- **定义**：不再维护的历史规范
- **内容**：历史变更记录、归档原因
- **转移**：永不转移

---

## Spec 模板

每条 spec 必须包含以下字段：

```markdown
---
id: SPEC-{序号}
title: {功能名称}
status: {planned|implemented|archived}
created: {创建日期}
updated: {最后更新日期}
owner: {负责人}
---

## 概述
{功能描述}

## 契约（Contract）
{该功能对外提供的接口、行为保证}

## 验收标准（Acceptance Criteria）
- [ ] {标准1}
- [ ] {标准2}

## 实现锚点（Implementation）
- 页面：{src/pages/...}
- 组件：{src/components/...}
- 云函数：{cloudfunctions/...}

## 兼容影响（Compatibility）
{如有 breaking change，在此说明}
```

---

## PR 合并前 Spec 对账清单

### A. 功能变更检查

| 检查项 | 说明 | 必须 |
|--------|------|------|
| spec-001 | 是否需要新建 spec？ | 若是，新建 spec |
| spec-002 | 是否需要更新现有 spec？ | 若是，更新相关字段 |
| spec-003 | 是否需要更新 spec 状态？ | 若是，填写转移理由 |
| spec-004 | 是否需要评估兼容影响？ | 若是，填写 breaking changes |

### B. 测试完整性检查

| 检查项 | 说明 | 必须 |
|--------|------|------|
| test-001 | 单元测试是否覆盖新增代码？ | 是 |
| test-002 | 集成测试是否验证核心流程？ | 是 |
| test-003 | Mock 数据是否与 spec 一致？ | 是 |

### C. 文档完整性检查

| 检查项 | 说明 | 必须 |
|--------|------|------|
| docs-001 | 代码注释是否完整？ | 是 |
| docs-002 | API 文档是否更新？ | 若是接口变更 |
| docs-003 | Changelog 是否记录？ | 是 |

### D. 代码质量检查

| 检查项 | 说明 | 必须 |
|--------|------|------|
| quality-001 | ESLint 检查是否通过？ | 是 |
| quality-002 | TypeScript 类型是否完整？ | 是 |
| quality-003 | 是否有未处理的 console.error？ | 检查 |

---

## 当前 Spec 列表

### governance/
- AGENTS.md - 项目治理规范

### features/planned/
暂无

### features/implemented/
- [SPEC-001](./features/implemented/SPEC-001-meter-recognition.md) - 智能读表识别

### features/archived/
暂无

---

## 维护指南

### 新增 Spec

1. 在对应状态目录创建 `{SPEC-ID}-{简短名称}.md`
2. 填写完整模板字段
3. 更新本文件底部的列表

### 更新 Spec

1. 修改相关字段（契约、验收标准等）
2. 更新 `updated` 日期
3. 在 changelog 中记录变更

### 状态转移

1. 从原目录移动文件到新目录
2. 更新文件内的 `status` 字段
3. 填写转移理由和日期

---

## 变更记录

| 日期 | 操作 | 负责人 |
|------|------|--------|
| 2026-06-25 | 初始化 spec 账本 | AI Assistant |
