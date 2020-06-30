import Axios from "axios";
import config from "@src/config";

import * as dayjs from "dayjs";

import { getManager, Repository, LessThan, Like, MoreThan } from "typeorm";

interface IAccessResponse {
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

interface IMessagePayload {
  title?: string;
  touser: string;
  content: string;
  page?: string;
  replyer?: string;
}

interface IMessageToLawyerApplyRefund {
  orderNo: string;
  username: string;
  caseType: string;
  amount: number;
  touser: string;
  page: string;
}

interface IRejectRefund {
  orderNo: string;
  touser: string;
  reason: string;
  comment: string;
  page: string;
}

export default class WxService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  static async authCode2Session(js_code: string) {
    const url = `https://api.weixin.qq.com/sns/jscode2session`;

    return Axios.get(url, {
      params: {
        grant_type: "authorization_code",
        appid: config.weixin.appid,
        secret: config.weixin.appSecret,
        js_code
      }
    });
  }

  static async getAccessToken(): Promise<any> {
    const url = `https://api.weixin.qq.com/cgi-bin/token`;

    return Axios.get(url, {
      params: {
        grant_type: "client_credential",
        appid: config.weixin.appid,
        secret: config.weixin.appSecret
      }
    });
  }

  static async sendCaseStatusUpdate(payload) {
    const { data } = await this.getAccessToken();
    const ACCESS_TOKEN = data.access_token;

    if (!ACCESS_TOKEN) return;
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`;
    return Axios.post(url, {
      access_token: ACCESS_TOKEN,
      touser: payload.touser,
      template_id: config.weixin["message_template"]["case_status_update"],
      page: payload.page,
      data: {
        phrase1: {
          value: payload.caseStatus
        },
        date2: {
          value: dayjs().format("YYYY-MM-DD HH:mm:ss")
        },
        thing3: {
          value: payload.comment
        }
      }
    });
  }

  static async sendLawyerVerifyResult(payload) {
    const { data } = await this.getAccessToken();
    const ACCESS_TOKEN = data.access_token;

    if (!ACCESS_TOKEN) return;
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`;
    return Axios.post(url, {
      access_token: ACCESS_TOKEN,
      touser: payload.touser,
      template_id: config.weixin["message_template"]["verfiy_feedback"],
      page: payload.page,
      data: {
        thing1: {
          value: payload.result
        },
        thing3: {
          value: payload.comment
        }
      }
    });
  }

  static async sendRefundResultFeedback(payload: IRejectRefund) {
    const { data } = await this.getAccessToken();
    const ACCESS_TOKEN = data.access_token;

    if (!ACCESS_TOKEN) return;
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`;

    return Axios.post(url, {
      access_token: ACCESS_TOKEN,
      touser: payload.touser,
      template_id: config.weixin["message_template"]["refund_feedback"],
      page: payload.page,
      data: {
        character_string1: {
          value: payload.orderNo // 订单号
        },
        thing2: {
          value: payload.reason // 拒绝原因
        },
        thing3: {
          value: payload.comment
        }
      }
    });
  }
}
