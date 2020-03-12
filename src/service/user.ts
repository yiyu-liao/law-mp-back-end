import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";
import Lawyer from "@src/entity/lawyer";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import WxService from "./wx";

export default class UserService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
   * @api {post} /user/authSession 登录获取openid
   * @apiName authSession
   * @apiDescription 返回用户信息
   * @apiGroup User
   *
   * @apiParam {Number} js_code, 登录时获取的 code
   * @apiParam {Object} user_info, 用户信息
   * @apiSuccess {String} code S_Ok
   */
  static async authSession(context?: Context) {
    const {
      js_code,
      user_info: { nickName, avatarUrl }
    } = context.request.body;

    const {
      data: { openid, errcode, errmsg }
    } = await WxService.authCode2Session(js_code);

    if (!errcode) {
      const userRepo = this.getRepository<User>(User);
      const user = await userRepo.findOne({
        where: { openid },
        relations: ["extra_profile"]
      });
      if (!user) {
        let newUser = await userRepo.save(
          userRepo.create({
            openid,
            nick_name: nickName,
            avatar_url: avatarUrl,
            role: 0
          })
        );
        return {
          code: ResponseCode.SUCCESS.code,
          data: newUser ? newUser : null,
          message: ResponseCode.SUCCESS.msg
        };
      } else {
        return {
          code: ResponseCode.SUCCESS.code,
          data: user ? user : null,
          message: ResponseCode.SUCCESS.msg
        };
      }
    } else {
      return {
        code: errcode,
        message: errmsg
      };
    }
  }

  /**
   * @api {post} /user/update 更新用户信息
   * @apiName register
   * @apiGroup User
   *
   * @apiParam {Number} user_id  用户id, 非openid.
   * @apiParam {Number} avatar_url 用户头像url
   * @apiParam {Number} nick_name  用户昵称
   * @apiParam {Number} real_name  用户真实姓名
   * @apiParam {Number} role  用户角色  0 => null role, 1 => customer, 2 => lawyer
   * @apiParam {Number} verify_status  用户状态 1 => 未认证， 2 => 认证中， 3 => 已认证
   * @apiSuccess {String} code S_Ok
   */
  static async updateUser(context?: Context) {
    const userRepo = this.getRepository<User>(User);

    const { user_id } = context.request.body;

    if (!user_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    const user = userRepo.create({
      ...(context.request.body as User)
    });

    let result = await userRepo.update(user_id, user);
    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /user/applyVerify 律师申请认证
   * @apiName LawyerapplyVerify
   * @apiGroup User
   *
   * @apiParam {Number} user_id  用户id, 非openid
   * @apiParam {Number} office  所在律所
   * @apiParam {Number} location  所在地区
   * @apiParam {Number} experience_year  经验年限
   * @apiParam {String} id_photo  正冠照片
   * @apiParam {String} license_photo  律师执业证照片
   * @apiParam {String} license_no  律师执业编号
   *
   *
   * @apiSuccess {String} code S_Ok
   *
   */
  static async updateLawyerVerifyInfo(context?: Context) {
    const userRepo = this.getRepository<User>(User);

    const params = context.request.body;
    let userId = params.user_id;
    delete params.user_id;

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
      message: ResponseCode.SUCCESS.msg
    };
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
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }
    const user = await userRepo.findOne({
      where: { openid },
      relations: ["extra_profile"]
    });
    return {
      code: ResponseCode.SUCCESS.code,
      data: user ? user : null,
      message: ResponseCode.SUCCESS.msg
    };
  }
}
