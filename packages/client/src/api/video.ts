import request from '@client/utils/request';
import {
  GET_VIDEOS_ANALYSIS_API,
  GET_VIDEOS_ANALYSIS_VERSIONS_API,
  GET_VIDEOS_DETAIL_API,
  GET_VIDEOS_LIST_API,
  POST_VIDEOS_ANALYZE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { AxiosResponse } from 'axios';

/**
 * 获取视频列表
 */
export async function getVideosList(
  params?: PickServerReq<typeof GET_VIDEOS_LIST_API>
) {
  return (await request.get(GET_VIDEOS_LIST_API, { params })) as AxiosResponse<
    PickServerRes<typeof GET_VIDEOS_LIST_API>
  >;
}

/**
 * 获取视频详情
 */
export async function getVideosDetail(
  params: PickServerReq<typeof GET_VIDEOS_DETAIL_API>
) {
  return (await request.get(GET_VIDEOS_DETAIL_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_VIDEOS_DETAIL_API>>;
}

/**
 * 触发视频分析
 */
export async function postVideosAnalyze(
  data: PickServerReq<typeof POST_VIDEOS_ANALYZE_API>
) {
  return (await request.post(POST_VIDEOS_ANALYZE_API, data)) as AxiosResponse<
    PickServerRes<typeof POST_VIDEOS_ANALYZE_API>
  >;
}

/**
 * 获取视频分析版本列表
 */
export async function getVideosAnalysisVersions(
  params: PickServerReq<typeof GET_VIDEOS_ANALYSIS_VERSIONS_API>
) {
  return (await request.get(GET_VIDEOS_ANALYSIS_VERSIONS_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_VIDEOS_ANALYSIS_VERSIONS_API>>;
}

/**
 * 获取指定分析内容
 */
export async function getVideosAnalysis(
  params: PickServerReq<typeof GET_VIDEOS_ANALYSIS_API>
) {
  return (await request.get(GET_VIDEOS_ANALYSIS_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_VIDEOS_ANALYSIS_API>>;
}
