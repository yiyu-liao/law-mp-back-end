import { Context } from "koa";
import { getManager, Repository } from "typeorm";
import User from "@src/entity/user";

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

export default class UserService {
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
        data: {
          user
        },
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
}
