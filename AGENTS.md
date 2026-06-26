# AGENTS.md - 项目治理规范

> 本文件定义了智能读表小程序的开发治理规则，适用于所有贡献者。

## 1. Issue 分类

### 1.1 分类维度

| 分类标签 | 说明 | 示例 |
|---------|------|------|
| `type/bug` | 局部缺陷修复 | 识别结果精度问题 |
| `type/feature` | 新功能开发 | 添加批量导出功能 |
| `type/refactor` | 代码重构 | 重构状态管理模块 |
| `type/docs` | 文档更新 | 更新API文档 |

### 1.2 影响维度

| 影响标签 | 说明 | 处理优先级 |
|---------|------|----------|
| `impact/local` | 仅影响局部功能 | 可独立测试 |
| `impact/design` | 涉及UI/UX变更 | 需设计评审 |
| `impact/public-api` | 涉及公共接口变更 | 需兼容性评估 |
| `impact/cross-issue` | 多issue同根因 | 需关联分析 |

### 1.3 状态标签

| 状态标签 | 说明 |
|---------|------|
| `status/planned` | 计划中 |
| `status/in-progress` | 进行中 |
| `status/implemented` | 已实现 |
| `status/archived` | 已归档 |

---

## 2. 分支命名规范

### 2.1 格式

```
{type}/{issue-id}-{简短描述}
```

### 2.2 类型前缀

| 前缀 | 用途 | 示例 |
|------|------|------|
| `bugfix/` | 缺陷修复 | `bugfix/fix-recognition-accuracy` |
| `feature/` | 新功能 | `feature/batch-export` |
| `refactor/` | 重构 | `refactor/state-management` |
| `hotfix/` | 紧急修复 | `hotfix/critical-security` |

### 2.3 示例

```bash
# 创建分支
git checkout -b bugfix/fix-upload-timeout
git checkout -b feature/add-ocr-api
```

---

## 3. 测试要求

### 3.1 单元测试覆盖

| 模块 | 覆盖率要求 | 测试工具 |
|------|----------|---------|
| services/ | ≥80% | Jest |
| utils/ | ≥90% | Jest |
| hooks/ | ≥80% | React Testing Library |

### 3.2 集成测试

- 每个云函数需有对应的 mock 测试
- 页面交互需通过 e2e 测试验证

### 3.3 测试通过标准

```bash
# 本地验证
npm run test          # 单元测试
npm run test:e2e     # 端到端测试
npm run lint          # 代码规范检查
```

---

## 4. Spec 对账规则

### 4.1 Spec 状态定义

| 状态 | 定义 | 转移条件 |
|------|------|---------|
| `governance` | 治理文档 | 永不转移 |
| `planned` | 已规划的功能 | 实现完成 |
| `implemented` | 已实现的功能 | 通过验收 |
| `archived` | 已归档 | 永不转移 |

### 4.2 对账触发时机

1. **PR 合并前**：必须完成 spec 同步
2. **版本发布前**：完整 spec 审查
3. **设计变更**：触发相关 spec 更新

### 4.3 对账责任人

| 角色 | 职责 |
|------|------|
| PR Author | 更新 spec 状态，填写对账清单 |
| Reviewer | 验证 spec 同步完整性 |
| Maintainer | 批准 spec 状态转移 |

---

## 5. 完成定义 (Definition of Done)

### 5.1 功能完成标准

- [ ] 代码实现完成并通过 lint
- [ ] 单元测试覆盖率达标
- [ ] 集成测试通过
- [ ] Spec 文档已更新
- [ ] 变更说明已记录
- [ ] PR 已通过 code review

### 5.2 Spec 同步完成标准

- [ ] 相关 spec 状态已更新
- [ ] 实现锚点已填写
- [ ] 验收标准已通过
- [ ] 兼容影响已评估（如有）
- [ ] 对账清单已填写

### 5.3 发布完成标准

- [ ] 所有 planned spec 已转为 implemented
- [ ] 无遗留的 blocking issue
- [ ] changelog 已更新
- [ ] 版本号已递增

---

## 6. PR 合并检查清单

详见 [spec/README.md](./spec/README.md) 中的 `PR 合并前 Spec 对账清单`

---

## 7. 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-06-25 | 1.0.0 | 初始版本 | AI Assistant |
