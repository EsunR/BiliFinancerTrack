import analysisModel from './Analysis';
import transcriptModel from './Transcript';
import upperModel from './Upper';
import videoModel from './Video';

export function setupAssociations() {
  // Upper 和 Video 的关联：一个 UP 主有多个视频
  upperModel.hasMany(videoModel, {
    foreignKey: 'upper_id',
    as: 'videos',
  });

  videoModel.belongsTo(upperModel, {
    foreignKey: 'upper_id',
    as: 'upper',
  });

  // Video 和 Transcript 的关联：一个视频有多个语音转写片段
  videoModel.hasMany(transcriptModel, {
    foreignKey: 'video_id',
    as: 'transcripts',
  });

  transcriptModel.belongsTo(videoModel, {
    foreignKey: 'video_id',
    as: 'video',
  });

  // Video 和 Analysis 的关联：一个视频有多个分析记录
  videoModel.hasMany(analysisModel, {
    foreignKey: 'video_id',
    as: 'analyses',
  });

  analysisModel.belongsTo(videoModel, {
    foreignKey: 'video_id',
    as: 'video',
  });
}
