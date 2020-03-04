import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import axios from 'axios';
import * as Config from '../../config.json';

export default class UserService {


    /**
     * @api {post} /user/login 登录获取openid
     * @apiName login
     * @apiGroup User
     *
     * @apiParam {Number} js_code, 登录时获取的 code
     * @apiSuccess {String} code 200
     */
    static async login(context?: Context) {
      const { js_code } = context.request.body;
      const respone = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          js_code,
          appid: Config.appid,
          secret: Config.appSecret,
          grant_type: 'authorization_code'
        }
      });

      return respone;
    }

    /**
     * @api {post} /user/register 注册新用户
     * @apiName register
     * @apiGroup User
     *
     * @apiParam {Number} openid  用户唯一openid.
     * @apiParam {Number} role  用户角色，0为普通客户，1为律师
     * @apiParam {String} nick_name  用户名称
     *
     * @apiSuccess {String} code 200
     */
    static async register(context?: Context) {
     const userRepo = getManager().getRepository(User);
  
      const { openid, role, nick_name } = context.request.body;
  
      if (!openid || !role || !nick_name) {
        const error = {
          code: RequesetErrorCode.PARAMS_ERROR.code,
          msg: RequesetErrorCode.PARAMS_ERROR.msg
        };
        throw new HttpException(error);
      }
  
      let user = new User();
  
      user.openid = openid;
      user.role = role;
      user.nick_name = nick_name;
  
      try {
        let result = await userRepo.save(user);
        return {
          code: 200,
          data: result,
          msg: null
        };
      } catch (e) {
        const error = {
          code: e.code,
          msg: e.message
        };
        throw new HttpException(error);
      }
    }


    /**
     * @api {post} /user/detail 获取用户信息
     * @apiName detail
     * @apiGroup User
     *
     * @apiParam {Number} openid  用户唯一openid.
     *
     * @apiSuccess {String} code 200
     * 
     */
  static async getUserInfo(context?: Context) {
    const userRepo = getManager().getRepository(User);

    const { openid } = context.request.body;

    if (!openid) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      const user = await userRepo.findOne({ where: { openid } });
      return {
        code: 200,
        data: user,
        msg: null
      };
    } catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

   
}
