import {
  GET_VIDEOS_ANALYSIS_API,
  GET_VIDEOS_ANALYSIS_VERSIONS_API,
  GET_VIDEOS_DETAIL_API,
  GET_VIDEOS_LIST_API,
  POST_VIDEOS_ANALYZE_API,
} from '.';
import {
  AnalysisAttributes,
  TranscriptAttributes,
  UpperAttributes,
  VideoAttributes,
} from '../../model';

// ==================== 基础类型 ====================

export interface VideoListItem
  extends Pick<
    VideoAttributes,
    | 'id'
    | 'bvid'
    | 'title'
    | 'coverUrl'
    | 'duration'
    | 'publishAt'
    | 'videoType'
    | 'status'
    | 'statusFailed'
    | 'processing'
  > {
  upper: UpperAttributes;
}

export interface TranscriptDetail
  extends Pick<
    TranscriptAttributes,
    'id' | 'content' | 'timestamps' | 'model'
  > {}

export interface AnalysisDetail
  extends Pick<
    AnalysisAttributes,
    'id' | 'promptVersion' | 'content' | 'model'
  > {
  isDefault: boolean;
}

// ==================== GET /videos/list ====================

export interface GetVideosListReq {
  upperId?: number;
  date?: string; // YYYY-MM-DD 格式，可选
}

export type GetVideosListRes = VideoListItem[];

// ==================== GET /videos/detail ====================

export interface GetVideosDetailReq {
  id: number;
}

export interface GetVideosDetailRes
  extends Pick<
    VideoAttributes,
    | 'id'
    | 'upperId'
    | 'bvid'
    | 'title'
    | 'coverUrl'
    | 'duration'
    | 'publishAt'
    | 'videoType'
    | 'status'
    | 'statusFailed'
  > {
  upperName: string;
  transcript: TranscriptDetail | null;
  analysis: AnalysisDetail | null;
}

// ==================== POST /videos/analyze ====================

export interface PostVideosAnalyzeReq {
  id: number;
  promptVersion?: string; // 可选，默认使用 default 版本
}

export interface PostVideosAnalyzeRes {}

// ==================== GET /videos/analysis-versions ====================

export interface GetVideosAnalysisVersionsReq {
  id: number;
}

export interface AnalysisVersionItem
  extends Pick<AnalysisAttributes, 'id' | 'promptVersion' | 'model'> {}

export interface GetVideosAnalysisVersionsRes {
  videoId: number;
  versions: AnalysisVersionItem[];
}

// ==================== GET /videos/analysis ====================

export interface GetVideosAnalysisReq {
  id: number;
  analysisId: number;
}

export interface GetVideosAnalysisRes
  extends Pick<
    AnalysisAttributes,
    'id' | 'videoId' | 'promptVersion' | 'model' | 'content'
  > {}

// ==================== VideoApi ====================

export interface VideoApi {
  [GET_VIDEOS_LIST_API]: {
    req: GetVideosListReq;
    res: GetVideosListRes;
  };
  [GET_VIDEOS_DETAIL_API]: {
    req: GetVideosDetailReq;
    res: GetVideosDetailRes;
  };
  [POST_VIDEOS_ANALYZE_API]: {
    req: PostVideosAnalyzeReq;
    res: PostVideosAnalyzeRes;
  };
  [GET_VIDEOS_ANALYSIS_VERSIONS_API]: {
    req: GetVideosAnalysisVersionsReq;
    res: GetVideosAnalysisVersionsRes;
  };
  [GET_VIDEOS_ANALYSIS_API]: {
    req: GetVideosAnalysisReq;
    res: GetVideosAnalysisRes;
  };
}
