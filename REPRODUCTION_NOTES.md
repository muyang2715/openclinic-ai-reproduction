# 项目简介

OpenClinic AI 是一个面向诊所和医院前台的开源 AI 语音接待员。它将浏览器实时语音、多 Agent 分流、知识库问答、医生查询、预约写入、急症识别、管理后台与通话归档放在同一个 TypeScript monorepo 中。

本目录保留上游 Git 历史和原作者文件，只做 macOS 本地复现、外部服务可选降级和明显安全边界的最小修复。

# 原仓库地址

- 上游：<https://github.com/hunainasif/openclinic>
- 复现基线：`89bd11037170a107301a82874e39e17e94a018ed`
- 基线提交：`feat: pre-call form, personalized agent & booking confirmation emails`

# 本地环境

| 项目    | 实测值                                            |
| ------- | ------------------------------------------------- |
| 系统    | macOS 15.2 (24C101)                               |
| 架构    | Apple Silicon arm64                               |
| Git     | 2.39.5 (Apple Git-154)                            |
| Node.js | 24.18.0                                           |
| pnpm    | 9.0.0（由 Corepack 按仓库 `packageManager` 固定） |
| 数据库  | Prisma Dev 本地 PostgreSQL/PGlite，数据端口 51214 |
| Web     | <http://localhost:3000>                           |
| API     | <http://localhost:5500>                           |
| Swagger | <http://localhost:5500/api-docs>                  |

> 项目使用 PostgreSQL，不是 SQLite。本地为了不安装 Homebrew/Postgres/Docker，使用 Prisma 官方的 `prisma dev` 启动可持久化的本地 PostgreSQL 兼容服务。生产环境仍应使用 Neon、Supabase 或受管 PostgreSQL。

# 安装步骤

```bash
git clone https://github.com/hunainasif/openclinic.git openclinic-reproduction
cd openclinic-reproduction

# 仓库指定 pnpm 9.0.0，不要使用系统中的 pnpm 11
corepack enable pnpm
corepack pnpm --version

# 上游 API postinstall 会立即读取 DATABASE_URL。首次安装先传一个合法 URL；
# 这一步只生成 Prisma Client，不会连接数据库。
DATABASE_URL='postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable' \
  corepack pnpm install --frozen-lockfile

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 无需 Docker/Homebrew 的本地数据库
corepack pnpm --filter api exec prisma dev --db-port 51214 --detach

# 填写两个 .env 后执行
corepack pnpm --filter api migrate:deploy
corepack pnpm --dir apps/web dlx @better-auth/cli@latest migrate --yes
corepack pnpm -F web seed:admin
corepack pnpm --filter api seed
```

`apps/api/.env` 和 `apps/web/.env` 均被 `.gitignore` 排除，实测权限设为 `600`。

# 环境变量

## API：`apps/api/.env`

| 变量                                    | 用途                      | 本地状态                               |
| --------------------------------------- | ------------------------- | -------------------------------------- |
| `DATABASE_URL`                          | PostgreSQL 连接           | 已配置                                 |
| `PORT` / `WEB_ORIGIN`                   | API 端口与 CORS           | `5500` / `http://localhost:3000`       |
| `OPENAI_API_KEY`                        | LangGraph 聊天/路由       | 已安全配置，未输出、未提交             |
| `OPENAI_BASE_URL`                       | OpenAI 兼容中转           | `https://apihub.agnes-ai.com/v1`       |
| `OPENAI_CHAT_MODEL`                     | 专科 Agent 模型           | `agnes-2.5-flash`                      |
| `OPENAI_ROUTER_MODEL`                   | Guardrail/Supervisor 模型 | `agnes-2.5-flash`                      |
| `OPENAI_EMBEDDING_MODEL` / `DIMENSIONS` | RAG 向量                  | 默认 `text-embedding-3-small` / `1536` |
| `PINECONE_API_KEY` / `PINECONE_INDEX`   | RAG 知识库                | 未提供                                 |
| `DEEPGRAM_API_KEY`                      | 语音转文字                | 未提供                                 |
| `ELEVENLABS_API_KEY` / `VOICE_ID`       | 文字转语音                | 未提供                                 |
| `RESEND_*`                              | 预约确认和急症通知        | 可选，未配置时安全跳过                 |
| `AWS_*` / `S3_BUCKET`                   | 通话录音存储              | 可选，未配置时只保留可用的文本记录     |

## Web：`apps/web/.env`

- `NEXT_PUBLIC_API_URL=http://localhost:5500/api/v1`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:5500`
- `DATABASE_URL`：与 API 使用同一数据库，Better Auth 会创建独立认证表。
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`：会话签名和 Web 基础 URL。
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`：只供单管理员 seed 脚本使用。

不要将真实 Key、生产数据库 URL 或管理员密码放入 Git。曾在聊天中发送过的 API Key 建议在演示后轮换。

# 启动方式

## 开发模式（推荐修改代码时）

```bash
corepack pnpm dev
```

## 生产构建模式（本次实测方式）

```bash
corepack pnpm build
corepack pnpm --filter api start
corepack pnpm --filter web start
```

当前本地已启动 API `5500`、Web `3000` 和数据库 `51214`。

# 测试结果

上游仓库没有 `test` 脚本，也没有 `*.test.*` / `*.spec.*` 文件，因此不存在可执行的上游自动化测试。本次没有伪造“测试全通过”，而是执行了下列静态和端到端验证：

| 验证                               | 结果                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `corepack pnpm lint`               | 通过，0 warning                                                                                           |
| `corepack pnpm check-types`        | 通过；共享包会先构建                                                                                      |
| `corepack pnpm build`              | 通过；API Prisma + TypeScript 与 Next.js 13 个路由全部完成                                                |
| `GET /api/v1/health`               | 200，API 与 PostgreSQL 均 ready                                                                           |
| `GET /api-docs/`                   | 200，Swagger UI 可访问                                                                                    |
| 医生/预约/分析 API                 | 200，返回真实 seed 数据                                                                                   |
| 管理员登录                         | 成功，可进入 `/dashboard`                                                                                 |
| Dashboard / Doctors / Appointments | 浏览器可见，数据与 PostgreSQL 一致                                                                        |
| 完整预约请求                       | `route=appointment`，调用 Tool 后真实写入；验证后已删除测试记录                                           |
| 缺失日期/时间的预约                | 正确追问，写入数从 6 保持为 6，无意外写入                                                                 |
| 急性胸痛+呼吸困难                  | `route=emergency`，立即给出拨打急救电话/急诊提示；Resend 未配置时不伪报发信                               |
| 诊所开放时间 FAQ                   | `route=faq`，Pinecone 未配置时明确说明知识库不可用                                                        |
| 无关的 JavaScript 问题             | Guardrail 阻断，`route=null`                                                                              |
| Socket.io 语音启动                 | `call:ready → agent:response → speaking:start → speaking:stop → call:error`                               |
| 浏览器 UI                          | 首页、登录、Dashboard、Doctors、Appointments、通话表单均完成截图和控件验证，未发现前端 console/page error |

> 预约写入安全测试中“6 保持为 6”是修复当时的即时计数。所有本轮临时预约已通过真实 DELETE API 清理，最终回到 4 条 seed 预约。

# 系统架构

```text
患者浏览器
  ├─ HTTPS/REST → Next.js 16 首页与管理后台
  └─ WebSocket → Socket.io Gateway
                     ↓
               Deepgram STT
                     ↓
              LangGraph StateGraph
     START → Guardrail → Supervisor
                           ├─ FAQ/RAG → Embeddings → Pinecone
                           ├─ Appointment → Tools → Prisma
                           └─ Emergency → Resend
                     ↓
               ElevenLabs TTS
                     ↓
              字幕 + MP3 返回浏览器

管理员 → Better Auth → Next.js Dashboard → Express REST → Prisma → PostgreSQL
                                                        └─ 通话录音 → ffmpeg → S3
```

- `apps/web`：Next.js App Router，负责公开展示页、麦克风采集、实时字幕、管理员认证和医生/预约/知识库/通话/分析页面。
- `apps/api`：Express + Socket.io，负责 REST、Agent 编排、STT/TTS、文档处理、邮件与录音归档。
- `packages/shared`：Web 和 API 共用的 Socket.io 事件名与 TypeScript 载荷类型。
- Prisma 是唯一的业务数据访问层；Better Auth 在同库中管理自己的认证表。

# LangGraph 工作流

```text
START
  ↓
guardrail
  ├─ blocked=true ─→ END（直接返回诊所范围拒答）
  └─ blocked=false
         ↓
     supervisor
       ├─ route=faq         → faq         → END
       ├─ route=appointment → appointment → END
       └─ route=emergency   → emergency   → END
```

`AgentState` 保存：`messages` 对话历史、当前 `input`、`sessionId`、可选的 `patientName`/`email`、路由 `route`、最终 `reply` 和 `blocked`。`messages` 使用 LangGraph reducer 追加，`MemorySaver` 以 `thread_id=sessionId` 保存多轮上下文。

Supervisor 使用结构化输出严格选择 `faq | appointment | emergency`。Appointment 节点内部是最多 4 轮的显式 Tool Calling loop：LLM 发出 tool call，服务器校验名称和 Zod 参数，执行 Tool，将 `ToolMessage` 追加到对话，再让 LLM 生成结果。图本身没有 Retry 节点；Tool loop 可在下一轮根据 Tool 错误文本改参重试，最多 4 轮。

# Tools 列表

| Tool               | 用途                                       | 参数                                                                                       | 数据访问                                            | 是否写数据 | 典型说法                                |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------- | --------------------------------------- |
| `list_doctors`     | 按医生姓名、科室或专科查找可用医生         | `query?`                                                                                   | `doctors.data.ts` → Prisma → `Doctor`               | 否         | “有皮肤科医生吗？”                      |
| `book_appointment` | 解析医生，检查同医生已有预约冲突，写入预约 | `doctorId?`, `doctorQuery?`, `patientName?`, `startTimeISO`, `durationMinutes?`, `reason?` | `doctors.data.ts` + `appointments.data.ts` → Prisma | 是         | “帮我预约 9 月 16 日上午 11 点的皮肤科” |

FAQ 的 Pinecone 相似度检索和 Emergency 的 Resend 通知是节点内部服务调用，不是 LangChain `Tool`。

# PostgreSQL 数据结构

本地最终数量：

| 表                         | 主要字段                                                                    |                      数量 |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------: |
| `Doctor`                   | id, name, department, speciality, isActive, timestamps                      |                         5 |
| `DoctorSchedule`           | id, doctorId, dayOfWeek, startTime, endTime                                 |                        25 |
| `Appointment`              | id, doctorId, patientName, patientEmail, startTime, endTime, status, reason |                         4 |
| `ScheduleException`        | doctorId, date, type, custom time, reason                                   |                         0 |
| `Document`                 | file metadata, extracted content, chunkCount, status                        |                         0 |
| `Call`                     | callId, duration, patient, transcript JSON, audioKey, status                |                         0 |
| `user` / `account`         | Better Auth 用户和凭据                                                      |                     1 / 1 |
| `session` / `verification` | Better Auth 会话和验证                                                      | 2 / 0（会话数随登录变化） |
| `_prisma_migrations`       | 已应用的迁移                                                                |                         4 |

Seed 医生示例：Amelia Carter（Cardiology）、Noah Bennett（Dermatology）、Sophia Nguyen（General Medicine）。Seed 预约示例：Emma Thompson 的心内科复诊、James Wilson 的皮肤科就诊、Ava Patel 的年度体检。

# API 接口

- `GET /api/v1/health`：API + PostgreSQL readiness。
- `POST /api/v1/agent/chat`：文本 Agent；请求包含 `sessionId`, `message`, 可选 `patientName`, `email`。
- `/api/v1/doctors/*`：医生 CRUD。
- `/api/v1/schedules/*`：周排班 CRUD，列表需 `doctorId`。
- `/api/v1/appointments/*`：预约 CRUD、状态筛选和患者姓名搜索。
- `/api/v1/exceptions/*`：停诊/自定义日期可用时段。
- `/api/v1/knowledgeBase/*`：上传 PDF/DOCX/TXT/MD、列表、删除。
- `/api/v1/analytics/*`：Dashboard 指标与分析。
- `/api/v1/calls/*`：通话列表、转写和录音元数据。
- Socket.io：`call:start`, `audio:chunk`, `user:turn-end`, `call:end` 及对应的 ready/transcript/response/TTS/status/error 事件。

Swagger 是当前仓库的准确接口入口：<http://localhost:5500/api-docs>。

# 演示 Case

1. 预约：“I would like to book a dermatology appointment.” → Agent 搜索到 Dr. Noah Bennett，但不会自己编日期时间，会追问。
2. 继续同一 `sessionId`：“September 16, 2026 at 11:00 AM works for me.” → 调用 `book_appointment` 并写入 PostgreSQL。
3. 急症：“I have sudden severe chest pain and cannot breathe.” → Supervisor 路由到 `emergency`，提示立即拨打当地急救电话或前往急诊。
4. FAQ：“What are the clinic opening hours?” → 路由到 `faq`；当前未配 Pinecone，会如实说明知识库未配置。
5. Guardrail：“Write a JavaScript sorting function.” → 阻断为与诊所无关。
6. 后台：登录后展示 5 位医生、25 条周排班、4 条预约以及实时统计图表。

# 本地兼容性修改

1. 增加 `OPENAI_BASE_URL` 与聊天/路由/embedding 模型覆盖，原默认值保持 GPT-4o、GPT-4o-mini 和 `text-embedding-3-small`。
2. Pinecone 从模块导入时强制初始化改为懒加载；未配置时只降级 FAQ/知识库，不再让整个 API 启动失败。
3. 补上上游 `prisma.config.ts` 已声明但实际缺失的 `apps/api/prisma/seed.ts`，使用稳定 ID 保证幂等。
4. 修正 README 中无法执行的 Better Auth CLI 命令，改用 `pnpm dlx @better-auth/cli@latest`。
5. 修复新鲜 clone 时 `check-types` 在 `@repo/shared/dist` 尚未生成就检查 Web 的问题，让类型检查先依赖上游 build。
6. 为预约写入增加确定性门禁：患者必须真实说过预约意图、日期和时间，才允许 Tool 落库，防止模型幻觉参数直接创建预约。
7. TTS 失败时用 `finally` 必定发送 `agent:speaking:stop` 并重置会话状态，同时给浏览器发可见 `call:error`。
8. 新增 `/api/v1/health` 数据库 readiness 端点和 Swagger 文档。

# 中文化与医院稳重风格

- 管理端、登录页、落地页、预约/医生/通话/知识库/分析页面，以及语音前台状态提示已统一为简体中文。
- 视觉系统切换为低饱和灰白背景、深青蓝主色和青绿色强调色，减少营销渐变，强化医院信息系统的可信、克制与可读性。
- 全局字体加入苹方、冬青黑体和微软雅黑回退链；图标、焦点态、按钮和表格保留原组件结构，避免改变业务流程。
- 医生姓名、OpenAI、Socket.io 等专有名词以及模型生成的自由文本仍可能保留英文；Agent 回复语言由当前模型/提示词决定，本轮没有改写医疗业务逻辑。
- 主要入口：`http://localhost:3000/`（产品页）、`http://localhost:3000/sign-in`（管理端登录）。

# 当前已知问题

- **RAG 外部阻塞**：没有 Pinecone Key/Index。且当前 Agnes 中转对 `text-embedding-3-small` 实测返回 HTTP 503 `model_not_found`。要演示 RAG，需额外提供支持 embedding 的 OpenAI 兼容端点以及 Pinecone 配置。
- **语音外部阻塞**：没有 Deepgram 和 ElevenLabs 的有效 Key，因此无法声称 STT/TTS 音频成功。Socket 协议、状态恢复和错误降级已真实验证。
- **邮件/S3 未配**：Resend 和 S3 本来就是可选的；预约仍会落库，但不会实际发邮件或上传录音。
- **上游功能缺口**：`book_appointment` 检查同一医生的预约重叠，但并没有读取 `DoctorSchedule` / `ScheduleException` 验证是否在门诊工作时间。README 中“against real doctor schedules”的表述高于当前实现，这是 upstream 项目现有问题。
- **对话状态不持久化**：LangGraph `MemorySaver` 和语音 session 是进程内存，重启、扩容或切换实例后丢失。
- **中转性能**：Agnes 模型的结构化输出和 Tool Calling 可用，但某些 Tool 后的最终 LLM 回复实测可超过 120 秒；数据写入已成功不代表前端已及时收到最终句子。
- **自动化测试缺失**：上游无 test runner/测试用例。
- **依赖漏洞**：`pnpm audit --prod --json` 报告 3 low、25 moderate、35 high、0 critical（596 个生产依赖）。高风险模块包括 Next.js、Socket.io parser、sharp、postcss、js-yaml 等直接/传递依赖。本轮没有为了降数字而全栈盲目升级；公网部署前应逐项确认可修复版本、回归构建与 Agent 流程。

# Vercel 部署风险审计

1. `apps/web` 是标准 Next.js 16，可作为独立 Vercel 项目部署。需将 `NEXT_PUBLIC_API_URL` 和 `NEXT_PUBLIC_SOCKET_URL` 指向公网 API，并将 Better Auth URL/数据库改为生产值。
2. Vercel Functions 当前支持 Fluid Compute WebSocket，Socket.io 客户端也已正确固定 `transports: ["websocket"]`。但现有 API 是一个执行 `server.listen()` 的长驻 Express/Socket.io 进程，仓库没有 `vercel.json` 或 Function/Services 入口，不能按现状一键部署到 Vercel。
3. Vercel Services 可表达 web + api 多服务，但 Services 仍是 beta，其 Node 多服务路径尚未被指引标记为完全验证。在没有真实 Vercel 项目和外部凭据前，不冒险加入实验配置。
4. WebSocket 函数连接到达最大执行时长后会断开，客户端需重连；新实例又无法访问当前的进程内 `sessions` 和 LangGraph `MemorySaver`。生产前需外置持久化 checkpointer/session store。
5. 本地 Prisma Dev/PGlite 不能用于 Vercel 生产；需外部 PostgreSQL 与连接池，并在发布前执行 `migrate:deploy`。
6. 文件上传、ffmpeg 音频合并、LLM/STT/TTS 请求会带来函数时长、内存、临时文件与包体风险，应在 Preview 环境做真实语音压测，不应只以 `next build` 成功作为部署成功标准。

保守的首次公网部署建议：**Vercel 托管 `apps/web`，长驻 Node 平台托管 `apps/api`，Neon/Supabase 托管 PostgreSQL**。等语音和持久化状态都通过后，再评估改造为 Vercel Functions/Services。

# 后续可以扩展的方向

- 用持久化 LangGraph checkpointer 和 Redis/共享 session 取代进程内状态。
- 让预约 Tool 同时验证 DoctorSchedule、ScheduleException、诊所时区和跨日边界。
- 增加 Vitest 单元测试、Agent 回归集、Socket.io 集成测试和 Playwright E2E。
- 对医疗类数据做最小化、加密、审计、保留期限和合规评审；当前代码是演示级，不能直接宣称符合 HIPAA/本地医疗法规。
- 增加人工转接队列、结构化急症审计与运营告警。
- 在不破坏原作品的前提下增加中英文 UI/语音和诊所品牌配置。
