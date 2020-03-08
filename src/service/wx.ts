import Axios from 'axios';
import * as Config from '../../config.js';

import { getManager, Repository, LessThan, Like, MoreThan } from "typeorm";
import WxFormId from '@src/entity/wx-form-id';


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

    static async getAccessToken() {
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
        let form = await this.getUserFormInfo(openid)
        if (!form) return;


        const { data } = await this.getAccessToken();
        const ACCESS_TOKEN = data.access_token;

        const date = new Date();
        const time = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getTime()}`

        if (!ACCESS_TOKEN) return;
        const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${ACCESS_TOKEN}`;
        let { data: messageResponse } =  await Axios.post(url, {
            data: {
                access_token: ACCESS_TOKEN,
                touser: openid,
                template_id: '',
                page: '',
                form_id: form.form_id,
                data: {

                }

            }
        });

        if (messageResponse.errcode === 0) {
            await this.deleteUsedFormId(form.id);
        }
        
        return messageResponse;

    }

    static async getUserFormInfo(openid) {
        const WxFormIdRepo = this.getRepository<WxFormId>(WxFormId);
    
        let currentTime = new Date().getTime();
    
        const res = await WxFormIdRepo.find({
          expire: MoreThan(currentTime),
          openid
        });
    
        return res[0]
    }

    static async deleteUsedFormId(id) {
        const WxFormIdRepo = this.getRepository<WxFormId>(WxFormId);
        const form = new WxFormId();
        form.id = id;
        return await WxFormIdRepo.remove(form);
    }




}