import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

export default class UserService {

    /**
     * @api {post} /user/register 注册新用户
     * @apiName register
     * @apiGroup User
     *
     * @apiParam {Number} openid  用户唯一openid.
     * @apiParam {Number} role  用户角色，0为普通客户，1为律师，3为管理员
     * @apiParam {String} name  用户名称
     *
     * @apiSuccess {String} code 200
     */
    static async register(context?: Context) {
      const userRepository = getManager().getRepository(User);
  
      const { openid, role, name } = context.request.body;
  
      if (!openid || !role || !name) {
        const error = {
          code: RequesetErrorCode.PARAMS_ERROR.code,
          msg: RequesetErrorCode.PARAMS_ERROR.msg
        };
        throw new HttpException(error);
      }
  
      let user = new User();
  
      user.openid = openid;
      user.role = role;
      user.name = name;
  
      try {
        let result = await userRepository.save(user);
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
    const userRepository = getManager().getRepository(User);

    const { openid } = context.request.body;

    if (!openid) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      const user = await userRepository.findOne({ where: { openid } });
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
