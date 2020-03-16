import { Context } from "koa";
import { getManager, Repository, getRepository } from "typeorm";
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
   * @apiName update
   * @apiGroup User
   * @apiParam {Number} user_id  用户id, 非openid
   * @apiParam {String} avatar_url  头像url(base_info)
   * @apiParam {String} nick_name  昵称(base_info)
   * @apiParam {String} real_name  真实姓名(base_info)
   * @apiParam {Number} verify_status  验证状态(base_info) // 1 => 未认证， 2 => 申请认证， 3 => 已认证
   * @apiParam {String} balance  余额(extra_profile)
   * @apiParam {String} office  所在律所(extra_profile)
   * @apiParam {String} location  所在地区(extra_profile)
   * @apiParam {String} experience_year  经验年限(extra_profile)
   * @apiParam {String} id_photo  正冠照片(extra_profile)
   * @apiParam {String} license_photo  律师执业证照片(extra_profile)
   * @apiParam {String} license_no  律师执业编号(extra_profile)
   * @apiParam {String} license_no  律师执业编号(extra_profile)
   *
   * @apiParamExample {json} Request-Example:
   *     {
   *       "user_id": 4711,
   *       "base_info": {
   *          "real_name": "吴彦祖"
   *       },
   *       "extra_profile": {
   *          "location": "xxx"
   *
   *       }
   *     }
   *
   *
   * @apiSuccess {String} code 200
   *
   */
  static async updateUserInfo(context?: Context) {
    const userRepo = this.getRepository<User>(User);
    const lawyerRepo = this.getRepository<Lawyer>(Lawyer);

    const { user_id, base_info, extra_profile } = context.request.body;

    if (!user_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    if (base_info) {
      let toUpdateFiles: Partial<User> = JSON.parse(base_info);
      for (const key in toUpdateFiles) {
        if (!toUpdateFiles[key]) {
          delete toUpdateFiles[key];
        }
      }
      if (Object.keys(toUpdateFiles).length) {
        const user = userRepo.create({
          ...toUpdateFiles
        });

        await userRepo.update(user_id, user);
      }
    }

    if (extra_profile) {
      let tempUser = await userRepo.findOne(user_id, {
        relations: ["extra_profile"]
      });
      let oldProfile = tempUser.extra_profile;
      let updatePayload: Partial<User> = JSON.parse(extra_profile);

      for (const key in updatePayload) {
        if (!updatePayload[key]) {
          delete updatePayload[key];
        }
      }

      if (Object.keys(updatePayload).length) {
        if (oldProfile) {
          let mergered = Object.assign({}, oldProfile, updatePayload);
          let newProfile = lawyerRepo.create({
            ...(mergered as Lawyer)
          });
          tempUser.extra_profile = newProfile;
          await userRepo.save(tempUser);
        } else {
          let newProfile = lawyerRepo.create({
            user: tempUser,
            ...(updatePayload as Lawyer)
          });
          await lawyerRepo.save(newProfile);
        }
      }
    }

    return {
      code: ResponseCode.SUCCESS.code,
      msg: ResponseCode.SUCCESS.msg
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

  /**
   * @api {post} /user/relateReply 获取与自己相关评论咨询
   * @apiName relationReply
   * @apiGroup User
   *
   * @apiParam {Number} user_id  用户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getUserRelateReply(context?: Context) {
    const { user_id } = context.request.body;

    if (!user_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :user_id", { user_id })
      .leftJoinAndSelect("user.create_replies", "create_replies")
      .leftJoinAndSelect("user.receive_replies", "receive_replies")
      .leftJoinAndSelect("create_replies.advice", "create_advice")
      // .leftJoinAndSelect("receive_replies.advice", "reply_advice")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }
}
