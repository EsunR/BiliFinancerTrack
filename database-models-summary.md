# 数据库模型创建总结

已成功根据 README 的数据库设计部分创建了所有所需的 Sequelize 模型。

## 创建的模型列表

### 1. Upper (up 主表)
- **文件**: `packages/server/src/model/Upper/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `uid`: INTEGER (B站UP主ID，唯一)
  - `name`: STRING (用户名)
  - `avatar`: STRING (头像URL)
  - `created_at`: DATE (创建日期)

### 2. Video (视频表)  
- **文件**: `packages/server/src/model/Video/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `upper_id`: INTEGER (外键关联Upper)
  - `cover_url`: STRING (封面URL)
  - `bvid`: STRING (B站视频编号，唯一)
  - `title`: STRING (视频标题)
  - `duration`: INTEGER (视频时长)
  - `publish_at`: DATE (发布日期)
  - `video_type`: ENUM('video', 'live') (视频类型)
  - `status`: ENUM (视频处理状态)
  - `status_failed`: BOOLEAN (处理失败标志)

### 3. Transcript (语音转写表)
- **文件**: `packages/server/src/model/Transcript/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `video_id`: STRING (外键关联Video)
  - `content`: TEXT (转写内容)
  - `timestamps`: JSON (时间戳数组)
  - `part_start_at`: INTEGER (音频分段起始点)
  - `audio_duration`: INTEGER (音频时长)
  - `model`: STRING (使用的模型)
  - `model_output_raw`: TEXT (模型原始输出)
  - `duration`: INTEGER (转写耗时)

### 4. Analysis (视频分析表)
- **文件**: `packages/server/src/model/Analysis/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `video_id`: STRING (外键关联Video)
  - `prompt_version`: STRING (Prompt版本)
  - `content`: TEXT (分析内容)
  - `model`: STRING (使用的模型)

### 5. DailyReport (日报表)
- **文件**: `packages/server/src/model/DailyReport/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `report_date`: DATE (报告日期)
  - `content`: TEXT (日报内容)
  - `include_video_ids`: JSON (关联的视频ID数组)

### 6. Model (模型表)
- **文件**: `packages/server/src/model/Model/index.ts`
- **字段**:
  - `id`: INTEGER (主键，自增)
  - `name`: STRING (模型名称)
  - `baseURL`: STRING (API基础URL)
  - `apiKey`: STRING (API密钥)
  - `model`: STRING (模型标识)
  - `type`: ENUM('text', 'audio_to_text') (模型类型)
  - `is_default`: BOOLEAN (是否为默认模型)

## 模型关联关系

在 `packages/server/src/model/associations.ts` 中定义了以下关联：

1. **Upper ↔ Video**: 一对多关系 (一个UP主有多个视频)
2. **Video ↔ Transcript**: 一对多关系 (一个视频有多个语音转写片段)
3. **Video ↔ Analysis**: 一对多关系 (一个视频有多个分析记录)

## 类型定义

所有模型对应的 TypeScript 类型定义位于 `packages/types/model/` 目录下。

## 验证结果

✅ 所有数据库表已成功创建
✅ 字段类型和约束正确
✅ 外键关联正确建立
✅ 类型定义完善
✅ 模型关联配置完成

数据库文件位置: `packages/server/public/database/express-vue-template.sqlite`