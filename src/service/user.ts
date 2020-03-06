import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";
import WxFormId from "@src/entity/wx-form-id";

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import WxService from './wx';

export default class UserService {

    static getRepository<T>(target: any): Repository<T> {
      return getManager().getRepository(target);
    }

    /**
     * @api {post} /user/authSession 登录获取openid
     * @apiName authSession
     * @apiGroup User
     *
     * @apiParam {Number} js_code, 登录时获取的 code
     * @apiSuccess {String} code 200
     */
    static async authSession(context?: Context) {
      const { js_code } = context.request.body;

      const res = await WxService.authCode2Session(js_code);      
      
      return res.data;
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
     const userRepo = this.getRepository<User>(User);
  
      const { openid, role, nick_name } = context.request.body;
  
      if (!openid || !role || !nick_name) {
        const error = {
          code: RequesetErrorCode.PARAMS_ERROR.code,
          msg: RequesetErrorCode.PARAMS_ERROR.msg
        };
        throw new HttpException(error);
      }
  
      try {
        const user = userRepo.create({
          openid,
          role,
          nick_name
        })

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
    const userRepo = this.getRepository<User>(User);

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


  /**
     * @api {post} /user/collectionFormId 收集表单id, 用于模版推送
     * @apiName collectionFormId
     * @apiGroup User
     *
     * @apiParam {Number} openid  用户唯一openid.
     * @apiParam {Number} form_id 表单id.
     * @apiSuccess {String} code 200
     * 
   */
  static async collectionFormId(context?: Context) {
    const WxFormIdRepo = this.getRepository<WxFormId>(WxFormId);
    
    const { openid, form_id } = context.request.body;

    if (!openid || !form_id) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      const formInfo = WxFormIdRepo.create({
        openid,
        form_id,
        expire: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
      });
  
      const res = await WxFormIdRepo.save(formInfo);
      
      return {
        code: 200,
        data: res,
        msg: null
      }

    }catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }
}
