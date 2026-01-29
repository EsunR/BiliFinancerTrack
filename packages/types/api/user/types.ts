import { GET_USER_INFO_API, POST_USER_CREATE_API } from '.';
import { UserAttributes } from '../../model/user';

export interface PostUserCreateReq {
  name: string;
  password: string;
}

export interface PostUserCreateRes {
  name: string;
}

export interface UserApi {
  [POST_USER_CREATE_API]: {
    req: PostUserCreateReq;
    res: PostUserCreateRes;
  };
  [GET_USER_INFO_API]: {
    req: {
      name: string;
    };
    res: Pick<UserAttributes, 'id' | 'name' | 'createdAt' | 'note'>;
  };
}
