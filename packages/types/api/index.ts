import { TestApi } from './test';
import { UpperApi } from './upper';
import { UserApi } from './user/types';

export type ServerAPI = TestApi & UserApi & UpperApi;

export type PickServerReq<P extends keyof ServerAPI> = ServerAPI[P]['req'];
export type PickServerRes<P extends keyof ServerAPI> = ServerAPI[P]['res'];

export interface ResponseData<T = any> {
  success: boolean;
  data: T;
  msg: string;
}

export * from './test';
export * from './user';
export * from './upper';
