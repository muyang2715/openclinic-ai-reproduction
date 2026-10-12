<div align="center">

# 🏥 Open Clinic AI

### 面向医疗诊所的开源 AI 语音接待系统

让患者像与真人前台交流一样拨打电话：**自动解答诊所相关问题、查询医生排班并预约就诊、识别紧急情况并及时通知诊所**。

**7 × 24 小时在线，减少人工前台的重复性工作。**

采用 **LangGraph.js 多智能体架构**，集成 **Deepgram 语音识别**与 **ElevenLabs 语音合成**，
基于 **Next.js + Express + Prisma + PostgreSQL** Monorepo 构建。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![欢迎贡献](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#参与贡献)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)

</div>

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [AI 架构](#ai-架构)
- [项目目录结构](#项目目录结构)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [常用命令](#常用命令)
- [环境变量配置](#环境变量配置)
- [相关文档](#相关文档)
- [参与贡献](#参与贡献)
- [开源协议](#开源协议)

---

## 项目简介

传统诊所前台经常面临电话接待压力：非营业时间的来电容易转入语音信箱；营业时间里，工作人员需要同时处理到访患者和电话咨询，导致来电等待。许多电话涉及重复性问题，例如营业时间、保险信息，以及“下周能预约心脏科医生吗？”等。

这些问题虽然常见，却必须处理准确：预约冲突可能影响诊疗安排，漏判紧急情况也可能带来严重后果。单纯增加前台人员并不能轻松覆盖夜间和周末时段。

**Open Clinic AI 旨在通过 AI 语音接待员处理这些来电。** 系统将患者语音转换为文本，判断咨询意图，调用对应智能体与业务工具，再通过自然语音回复患者。多轮会话可保留上下文，并在需要时执行预约、查询和发送通知等操作。

项目采用**白标（White-label）设计**：底层 AI 接待模式不依赖医疗行业，可按需适配其他需要语音接待与业务办理的场景。

---

## 功能特性

- 🎙️ **实时语音交互**：浏览器与服务端通过 Socket.io 通信，完成 Deepgram 语音转文本（STT）→ AI 智能体处理 → ElevenLabs 文本转语音（TTS），并显示实时字幕。
- 🧠 **LangGraph.js 多智能体协作**：通过安全检查（Guardrail）与调度智能体（Supervisor），将每轮对话分发给合适的专用智能体，并保留会话级记忆。
- 📚 **RAG 诊所知识库**：支持上传 PDF、DOCX、TXT 文档，经文本处理与向量化后存入 Pinecone；FAQ 智能体严格依据诊所知识库检索结果回答，避免编造信息。
- 📅 **智能预约挂号**：调用工具查询医生、检查排班及时间冲突，并通过与管理后台一致的数据层创建预约；预约成功后可通过 Resend 发送带诊所品牌信息的邮件确认函。
- 🙋 **个性化通话**：通话前收集来电者姓名和邮箱，AI 可称呼患者姓名，并在整个会话中记住这些信息。
- 🚨 **紧急情况升级处理**：识别需要紧急关注的情况，并通过 Resend 立即向诊所发送邮件警报。
- 📊 **管理后台**：统一管理医生、排班、预约、数据分析和知识库。
- 📞 **通话录音与历史记录**：使用 ffmpeg 合并通话音频并存入 AWS S3，同时保存完整对话文本；管理员可在后台回放录音。
- 🔐 **身份认证与权限控制**：基于 Better Auth 的邮箱和密码登录；采用单管理员账户，管理后台需登录访问，公开落地页无需登录。
- 📖 **API 文档**：基于 OpenAPI，使用 Swagger UI 在 `/api-docs` 提供交互式接口文档。

---

## AI 架构

每一轮用户输入都会经过一个 **LangGraph.js `StateGraph`**。状态使用 **Zod** 定义，并通过以 `sessionId` 为键的**内存检查点（In-memory Checkpointer）**保存上下文，从而在同一通话的多个轮次之间保留记忆。

### 多智能体调用流程

```text
                    ┌───────────────┐
    START ─────────▶ │   Guardrail   │ ── 拦截 ──▶ END
                    │   安全检查     │
                    └───────┬───────┘
                            │ 通过
                    ┌───────▼───────┐
                    │  Supervisor   │
                    │   任务调度     │
                    └───┬───┬───┬───┘
                        │   │   │
              ┌─────────┘   │   └─────────┐
              ▼             ▼             ▼
         FAQ Agent   Appointment Agent  Emergency Agent
         知识库问答       预约处理          紧急处理
              │             │             │
              └─────────────┴─────────────┘
                            │
                           END
```

| 智能体 / 模块 | 职责 |
| --- | --- |
| **Guardrail（安全检查）** | 优先执行，识别不安全或无关输入，并在必要时提前结束处理。 |
| **Supervisor（任务调度）** | 结合最近的对话记录和上一轮路由结果，将请求分配给 FAQ、Appointment 或 Emergency。 |
| **FAQ Agent（知识库问答）** | 从 Pinecone 向量库检索相关内容，严格依据检索结果回答诊所问题。 |
| **Appointment Agent（预约处理）** | 在显式工具调用循环中使用 `list_doctors`、`book_appointment` 等工具，并在预约前检查排班冲突。 |
| **Emergency Agent（紧急处理）** | 将紧急情况识别与消息通知分离，通过邮件辅助模块发送警报。 |

### 语音处理流程

系统采用按发言轮次处理的方式：浏览器采集一段用户语音，检测到停顿后，通过 Socket.io 将其发送到服务端。

```text
患者说话
   ↓
浏览器采集语音（检测停顿后提交）
   ↓ Socket.io
Deepgram：语音转文本（STT）
   ↓
LangGraph.js：识别意图、检索知识或调用业务工具
   ↓
ElevenLabs：文本转语音（TTS）
   ↓ Socket.io
浏览器播放语音并显示字幕
```

深入了解实现细节：[`docs/product-overview.md`](./docs/product-overview.md)；代码规范：[`docs/coding-standards.md`](./docs/coding-standards.md)。

---

## 项目目录结构

```text
open-clinic-ai/
├── apps/
│   ├── web/                  Next.js 16 前端：落地页、语音通话界面、管理后台
│   └── api/                  Express 5 + Prisma 7 后端：REST API、智能体、语音处理
├── packages/
│   ├── shared/               @repo/shared：Socket.io 事件协议及共享类型
│   ├── eslint-config/        共享 ESLint Flat Config
│   └── typescript-config/    共享 TypeScript 配置
├── docs/                     产品概览及代码规范
└── turbo.json                Turborepo 任务流水线配置
```

项目使用 **[Turborepo](https://turborepo.dev)** 和 **pnpm workspaces** 管理 Monorepo。

---

## 技术栈

### 前端（`apps/web`）

| 技术 / 库 | 版本 | 用途 |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16.2.0 | 基于 App Router 的应用框架 |
| [React](https://react.dev) | 19.2 | UI 开发 |
| [TanStack Query](https://tanstack.com/query) | 5.101 | 服务端状态管理 |
| [Better Auth](https://better-auth.com) | 1.6.22 | 邮箱及密码身份认证 |
| [Tailwind CSS](https://tailwindcss.com) | 4 | 页面样式 |
| [Framer Motion](https://www.framer.com/motion/) | 12.42 | 动画效果 |
| [React Hook Form](https://react-hook-form.com) | 7.80 | 表单管理 |
| [Zod](https://zod.dev) | 3.24 | 数据结构校验 |
| [Axios](https://axios-http.com) | 1.18 | HTTP 请求 |
| [socket.io-client](https://socket.io) | 4.8.3 | 实时通信客户端 |
| [Recharts](https://recharts.org) | 3.9 | 数据图表 |
| [Radix UI](https://www.radix-ui.com) | — | 无障碍 UI 基础组件 |
| [lucide-react](https://lucide.dev) | 1.21 | 图标 |
| [sonner](https://sonner.emilkowal.ski) | 2.0 | 消息提示 |

### 后端（`apps/api`）

| 技术 / 库 | 版本 | 用途 |
| --- | --- | --- |
| [Express](https://expressjs.com) | 5.2.1 | HTTP 服务框架 |
| [Prisma](https://www.prisma.io) + `@prisma/adapter-pg` | 7.8 | ORM 与 PostgreSQL 数据访问 |
| [@langchain/langgraph](https://langchain-ai.github.io/langgraphjs/) | 1.4.7 | 多智能体状态图 |
| [@langchain/openai](https://js.langchain.com) | 1.5.3 | 大语言模型与文本向量化 |
| [@langchain/pinecone](https://js.langchain.com) | 1.0.3 | 向量存储集成 |
| [@pinecone-database/pinecone](https://www.pinecone.io) | 5.1.2 | RAG 向量数据库 |
| [@deepgram/sdk](https://deepgram.com) | 5.5 | 语音转文本（STT） |
| [@elevenlabs/elevenlabs-js](https://elevenlabs.io) | 2.54 | 文本转语音（TTS） |
| [socket.io](https://socket.io) | 4.8.3 | 实时语音数据传输 |
| [Resend](https://resend.com) | 6.16 | 紧急邮件与预约确认邮件 |
| [@aws-sdk/client-s3](https://aws.amazon.com/s3/) | 3.x | 通话录音存储 |
| [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) + ffmpeg-static | 2.1 / 5.3 | 音频合并 |
| [Multer](https://github.com/expressjs/multer) | 2.2 | 文件上传 |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) / [mammoth](https://github.com/mwilliamson/mammoth.js) | 2.4 / 1.12 | PDF / DOCX 文本提取 |
| [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) | 5.0 | API 文档 |
| [Zod](https://zod.dev) | 3.24 | 请求数据校验 |

---

## 环境要求

在开始前，请准备好：

- **Node.js** ≥ 18
- **pnpm** 9（可使用 `npm install -g pnpm` 安装）
- **PostgreSQL** 数据库（也可使用 [Neon](https://neon.tech) 免费套餐）
- **必需的 API Key**：OpenAI、Deepgram、ElevenLabs、Pinecone
- **可选的服务配置**：Resend（邮件通知）、AWS S3（通话录音存储）

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/hunainasif/openclinic.git
cd openclinic
```

### 2. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

根据实际环境填写两个 `.env` 文件中的数据库连接、API Key 和服务地址等配置。详细字段见[环境变量配置](#环境变量配置)。

### 4. 初始化后端数据库

```bash
# 应用仓库中已有的数据库迁移
pnpm --filter api migrate:deploy

# 若在本地开发时修改 Prisma Schema，可使用：
# pnpm --filter api migrate:dev
```

### 5. 初始化认证表并创建管理员

先在 `apps/web/.env` 中配置 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`，然后执行：

```bash
# 创建 Better Auth 所需的数据表
pnpm --dir apps/web dlx @better-auth/cli@latest migrate --yes

# 根据环境变量创建管理员账号
pnpm -F web seed:admin
```

> **安全提示**：系统采用单管理员账户设计。请在执行初始化前设置高强度、唯一的管理员密码，并妥善保存。

### 6. 启动开发环境

```bash
pnpm dev
```

启动后可访问：

| 服务 | 地址 |
| --- | --- |
| 前端应用 | http://localhost:3000 |
| 后端 API | http://localhost:5500 |
| Swagger API 文档 | http://localhost:5500/api-docs |

---

## 常用命令

项目使用 **pnpm 9**。除特别说明外，请在仓库根目录执行。

### Monorepo 命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 通过 Turborepo 启动所有应用并监听文件变更 |
| `pnpm build` | 构建所有 Workspace |
| `pnpm lint` | 执行代码检查，遵循零警告规则 |
| `pnpm check-types` | 检查所有 Workspace 的 TypeScript 类型 |
| `pnpm format` | 使用 Prettier 格式化项目代码 |
| `pnpm --filter web dev` | 仅启动前端 |
| `pnpm --filter api dev` | 仅启动后端 |

### 后端专用命令

以下脚本使用 `pnpm --filter api <script>` 的形式执行。

| 脚本 | 说明 |
| --- | --- |
| `build` | 执行 `prisma generate && tsc`，生成 `dist/` 产物 |
| `start` | 执行 `node dist/index.js`，启动生产服务 |
| `migrate:dev` | 在开发环境创建并应用数据库迁移 |
| `migrate:deploy` | 非交互式应用已提交的数据库迁移（用于生产环境） |
| `seed` | 运行 Prisma 种子数据脚本 |

### 生产环境启动顺序

```bash
pnpm install
pnpm --filter api build
pnpm --filter api migrate:deploy
pnpm --filter api start
```

> **部署注意事项**：这是一个 pnpm / Turborepo Monorepo。部署时应确保 Workspace 依赖可以正确解析；可以部署完整仓库，也可以通过 `turbo prune api` 生成精简后的独立部署包。另外，`ffmpeg-static` 包含平台相关的二进制文件，应在目标操作系统上安装依赖。

---

## 环境变量配置

完整配置模板位于：

- 后端：[`apps/api/.env.example`](./apps/api/.env.example)
- 前端：[`apps/web/.env.example`](./apps/web/.env.example)

### 后端环境变量（`apps/api/.env`）

| 变量名 | 必填 | 说明 |
| --- | :---: | --- |
| `DATABASE_URL` | ✅ | PostgreSQL 数据库连接字符串 |
| `PORT` | ✅ | API 服务端口，例如 `5500` |
| `WEB_ORIGIN` | ✅ | 允许的 CORS 来源，默认 `http://localhost:3000` |
| `OPENAI_API_KEY` | ✅ | 智能体 LLM 和 RAG Embedding 所需的 OpenAI 密钥 |
| `PINECONE_API_KEY` / `PINECONE_INDEX` | ✅ | Pinecone 向量数据库配置 |
| `DEEPGRAM_API_KEY` | ✅ | Deepgram 语音识别服务密钥 |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | ✅ | ElevenLabs 语音合成配置 |
| `RESEND_API_KEY` / `RESEND_FROM` / `EMERGENCY_EMAIL` | 可选 | 紧急提醒及预约确认邮件；未配置时不会发送对应邮件 |
| `CLINIC_NAME` | 可选 | 确认邮件中显示的诊所名称，默认 `OpenClinic AI` |
| `AWS_REGION` / `S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | 可选 | S3 通话录音存储；未配置时仅保留转写文本 |

### 前端环境变量（`apps/web/.env`）

| 变量名 | 必填 | 说明 |
| --- | :---: | --- |
| `NEXT_PUBLIC_API_URL` | ✅ | 后端 API 基础地址 |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Socket.io 服务端地址 |
| `DATABASE_URL` | ✅ | 与后端使用相同的数据库，用于 Better Auth 数据表 |
| `BETTER_AUTH_SECRET` | ✅ | 会话签名密钥，可使用 `openssl rand -hex 32` 生成 |
| `BETTER_AUTH_URL` | ✅ | 前端应用的基础地址 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 可选* | 仅供 `pnpm -F web seed:admin` 初始化管理员时使用 |

> *`ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 对一般运行流程属于可选项，但**首次执行管理员初始化脚本之前必须配置**。*

---

## 相关文档

| 文档 | 说明 |
| --- | --- |
| [`docs/product-overview.md`](./docs/product-overview.md) | 产品定位、目标问题及系统实现方案 |
| [`docs/coding-standards.md`](./docs/coding-standards.md) | 代码规范与贡献者开发约定 |
| [`CLAUDE.md`](./CLAUDE.md) | 仓库配置、常用命令、Workspace 结构与 Prisma 设置参考 |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | 使用 AWS EC2、Nginx、PM2 和 GitHub Actions CI/CD 部署 |

---

## 参与贡献

欢迎社区贡献！如果计划进行较大范围的修改，请先提交 Issue 讨论方案。

提交代码前，请遵循 [`docs/coding-standards.md`](./docs/coding-standards.md) 中的规范，并确保以下检查通过：

```bash
pnpm lint
pnpm check-types
```

完成修改后即可发起 Pull Request。

推荐的 GitHub Topics：`ai-agent`、`voice-ai`、`langgraph`、`healthcare`、`rag`、`deepgram`、`elevenlabs`、`nextjs`、`express`、`prisma`、`typescript`、`receptionist`、`openai`。

---

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。

<div align="center">

**关键词：** AI 语音接待 · 医疗 AI · 智能预约 · LangGraph.js 多智能体 · RAG · Deepgram · ElevenLabs · Next.js · Express · Prisma · TypeScript · 开源

</div>
