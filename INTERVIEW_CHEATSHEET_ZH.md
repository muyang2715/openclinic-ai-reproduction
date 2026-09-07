# 面试讲解速记（2 分钟内）

这个项目解决的是诊所前台电话量大、夜间无人接听、重复问题多和预约易出错的问题。患者可以直接用语音咨询诊所信息、查医生、预约就诊，对急症描述则优先提示联系急救服务。

整体架构是 Next.js 前端 + Express/Socket.io 后端 + LangGraph.js 多 Agent + Prisma/PostgreSQL。语音链路是浏览器采集音频，Deepgram 转写，LangGraph 决策，ElevenLabs 合成语音，最后通过 Socket.io 返回音频和字幕。

它不是普通 ChatBot，因为它不只生成文字：它会进行安全检查、意图分流、知识库检索，还能调用 Tool 查真实医生、检查时间冲突并写入预约。

LangGraph 定义了可见、可约束的流程：START 先进 Guardrail，合法请求再进 Supervisor，Supervisor 用结构化输出选择 FAQ、Appointment 或 Emergency，执行后结束。同一 session 通过 MemorySaver 保留多轮上下文。

Tool Calling 在 Appointment 节点里是显式循环：LLM 输出 `list_doctors` 或 `book_appointment` 及结构化参数，Zod 校验后由服务器执行，结果作为 `ToolMessage` 回填给模型。如果 Tool 返回医生不存在、时间冲突或信息不全，模型可在最多 4 轮循环内改参或追问；StateGraph 本身没有单独 Retry 节点。

PostgreSQL 保存医生、排班、例外日、预约、知识文档元数据、通话转写和 Better Auth 账号。FastAPI 没有出现在这个仓库里；后端实际是 Express 5。Next.js 负责公开展示、通话界面和管理后台，Express 负责 Agent、REST、Socket.io 和业务数据访问。

这个复现还特别加了预约写入安全门禁：用户没有真实说出日期和时间时，即使模型幻觉出参数也不允许落库。这说明 Agent 不能只靠 prompt 保证安全，有副作用的 Tool 必须在代码层做确定性校验。
