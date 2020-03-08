import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";
import Lawyer from '@src/entity/lawyer';

import { ResponseCode } from "@src/constant";
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
          code: ResponseCode.ERROR_PARAMS.code,
          msg: ResponseCode.ERROR_PARAMS.msg
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
          code: ResponseCode.SUCCESS.code,
          data: result,
          msg: ResponseCode.SUCCESS.msg
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
     * @api {post} /user/applyVerify 获取用户信息
     * @apiName LawyerapplyVerify
     * @apiGroup User
     *
     * @apiParam {Number} openid  用户唯一openid.
     *
     * @apiSuccess {String} code 200
     * 
    */
    static async updateLawyerVerifyInfo(context?: Context) {

      const userRepo = this.getRepository<User>(User);

      const params = context.request.body;
      let userId = params.id;
      delete params.id
    
      try {
        let lawyer = new Lawyer();
        lawyer = {
          ...params
        };

        let user = userRepo.create({
          id: userId,
          extra_profile: lawyer
        });
        let result = userRepo.update(userId, user);
        return {
          code: ResponseCode.SUCCESS.code,
          data: result,
          msg: ResponseCode.SUCCESS.msg
        }
      }catch (e) {
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
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      const user = await userRepo.findOne({ where: { openid }, relations: ["extra_profile"] });
      return {
        code: ResponseCode.SUCCESS.code,
        data: user,
        msg: ResponseCode.SUCCESS.msg
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
