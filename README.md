# 1. 项目概述

该项目可以自动每日跟踪所配置的 B 站财经 UP 主的最新视频、以及直播内容，并对视频内容进行总结和整理，向用户输出这些财经 UP 主对时长的观点，并让 AI 参考这些观点，最终以日报的形式进行投资建议的分析，从而节约用户观看视频的时间。

# 2. 项目模块设计

### 模块1：UP 主视频追踪

**功能点：“添加 UP 主” 按钮** 

点击后会弹出弹窗，登记 UP 主的基础信息，用户输入 UP 主 ID 后，会主动拉取 UP 主头像、名称等内容。

**功能点：UP 主卡片**

- 显示 UP 主的封面、用户名，下方显示当日该 UP 主已经发布了多少个视频、已经总结完成了多少个视频；
- 提供“同步”按钮，用于用户点击后主动拉取 UP 主的最新视频；
- 点击卡片后会进入 UP 主的详情；

**功能点：UP 主详情**

- 将 up 主的视频以天为纬度展示在时间轴列表中；
- 列表中每个视频是一张单独的卡片，显示视频封面以及视频标题，点击视频卡片后会进入视频详情；

**功能点：为 UP 主上传直播视频**

在 UP 主详情页面，提供一个“上传 UP 主直播”按钮，可以将 UP 主的直播进行上传（或者提供一个本地路径），上传后的直播讲会作为普通视频一样自动进入语音转写、AI 分析的流程。

**功能点：视频详情**

- 顶部展示视频标题、发布时间、UP 主等基础信息
- 左侧显示 AI 总结内容，右侧显示时间戳
- 默认的总结内容为一个固定的 Prompt，只是对视频内容进行简单总结
- 用户可以自定义 Prompt，并选择重新生成 AI 总结，每个总结结果会有一个版本 ID

### 模块2：日报

**功能点：日历视图**

日报模块提供一个日历视图，点击可以进入每日详情

**功能点：日报设置**

- 点击“设置”按钮进入日报设置模块
- 可以选择“自动”或者“手动”两种日报总结模式
- 在自动模式下，需要选择每日几点开启AI总结
- 可以设置当前持仓状态，作为上下文传递给 AI 总结，AI 会给出持仓建议

**功能点：当日详情**

- 进入当日详情页面，会展示出 AI 总结出的笔记列表（Markdown 格式），笔记的最后会给出持仓建议
- 点击“生成日报”可以重新生成当前的日报，生成时可以勾选参与分析的 UP 主，以及该 UP 主参与分析的视频/直播

### 模块3：模型管理

**功能点：文本生成模型管理**

- 增删用于文本生成的模型，基于 openai sdk 可调用的；
- 内置：
	- DeepSeek
	- 豆包
	- 智谱 AI

**功能点：音频转写模型管理**

- 增删用于音频转写的模型
- 仅支持：
	- groq

# 3. 技术设计

### 数据库设计

**Uppers: up 主表**

- `uid: number` B 站 UP 主的 ID
- `name: string` 用户名
- `avatar: string` 头像
- `created_at: Date` 创建日期

**Videos: 视频表**

- `id: number`
- `upper_id: string` 外键
- `cover_url: string`
- `bvid: string` B 站视频编号
- `title: string` 视频标题
- `duration: number` 视频时长
- `publish_at: Date` 发布日期
- `video_type: 'video' | 'live'` 视频类型
- `status: StatusEnum`
	- downloading: 视频正在下载中
	- pending: 视频正在调用 ffmpeg 进行音视频分离中
	- transcribing: 正在进行音频转写，如果视频过大会对音频进行分段转写
	- analyzing: AI 分析中，后续如果用户点击重新分析，就会回滚至当前阶段
	- completed: 处理完成
- `status_failed: boolean` 当前视频的处理阶段是否失败，此时需要用户手动重试

**Transcripts: 语音转写表**

- `id: string`
- `video_id: string` 关联的视频 id
- `content: string` 转写的内容
- `timestamps: Array<{start: number, end: number, content: string}>` 音频文本与时间戳的对应关系
- `part_start_at: number` 如果是一个长音频，需要分段，标记当前音频分段的起始点
- `audio_duration: number` 音频时长
- `model: string` 使用的模型
- `model_output_raw: string` 模型输出的原始内容
- `duration: number` 转写耗时

**Analysis: 视频分析表**

- `id: string`
- `video_id: string` 关联的视频 ID
- `prompt_version: string` 引用的 Prompt 版本
- `content: string` 分析内容
- `model: string` 使用的大模型

**DailyReports: 日报表**

- `id: string`
- `report_date: Date`
- `content: string`
- `include_video_ids: string[]` 关联的视频 ID

**Models: 模型表**

- `id: string`
- `name: string`
- `baseURL: string`
- `apiKey: string`
- `model: string`
- `type: 'text' | 'audio_to_text'` 模型类型
- `is_default: boolean` 是否是默认使用的

