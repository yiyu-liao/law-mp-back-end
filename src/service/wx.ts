import Axios from 'axios';
import * as Config from '../../config.js';

import { getManager, Repository, LessThan, Like, MoreThan } from "typeorm";

interface IAccessResponse  {
    access_token?: string;
    expires_in?: number;
    errcode?: number;
    errmsg?: string;
}

interface IAuthSession {
    openid?: string;
    session_key?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
}

export default class WxService {
    static getRepository<T>(target: any): Repository<T> {
        return getManager().getRepository(target);
      }

    static async authCode2Session(js_code: string) {
        const url = `https://api.weixin.qq.com/sns/jscode2session`;

        return Axios.get(url, {
            params: {
                grant_type: 'authorization_code',
                appid: Config.appid,
                secret: Config.appSecret,
                js_code
            }
        });
    }

    static async getAccessToken(): Promise<any> {
        const url = `https://api.weixin.qq.com/cgi-bin/`;

        return Axios.get(url, {
            params: {
                grant_type: 'client_credential',
                appid: Config.appid,
                secret: Config.appSecret,
            }
        });
    }

    static async sendMessageToUser(openid: string | number, content: string, page: string = '') {
        const { data } = await this.getAccessToken();
        const ACCESS_TOKEN = data.access_token;

        const date = new Date();
        const time = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getTime()}`

        if (!ACCESS_TOKEN) return;
        const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`;
        return Axios.post(url, {
            data: {
                access_token: ACCESS_TOKEN,
                touser: openid,
                template_id: Config.subscribe_temple_id,
                page: '',
                data: {
                    key1: {
                        value: content
                    },
                    key2: {
                        value: time
                    },
                    key3: {
                        value: 'test-replyer',
                    },
                    key4: {
                        value: 'test-title'
                    }
                }

            }
        });
    }
}