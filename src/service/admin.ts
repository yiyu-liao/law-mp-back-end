import { Context } from "koa";
import { getManager, Repository, getRepository } from "typeorm";
import UserAdmin from "@src/entity/user-admin";
import User from "@src/entity/user.ts";
import Appeal from "@src/entity/case-appeal";
import PayOrder from "@src/entity/case-order";
import Case from "@src/entity/case";
import { UserVerifyStatus } from "@src/constant";

import * as moment from "moment";
moment.locale();

import { WxPayApi } from "@src/service/order";

import {
  ResponseCode as RES,
  PayOrderStatus,
  CaseStatus,
  AppealStatus,
  AdminUserStatus
} from "@src/constant";

import {
  createHttpResponse,
  doCrypto,
  comparePasword,
  generatePassword,
  generateTradeNumber
} from "@src/shared";

import fs = require("fs");
import path = require("path");
import jwt = require("jsonwebtoken");
const publicKey = fs.readFileSync(path.join(__dirname, "../../publicKey.pub"));

export default class AdminService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  static createToken(data) {
    const token = jwt.sign(data, publicKey, { expiresIn: "2h" });
    return token;
  }

  /**
   * @api {post} /api/admin/login 管理员登录
   * @apiName login
   * @apiGroup Admin
   *
   * @apiParam {String} username 用户名
   * @apiParam {Number} pasword 密码
   *
   * @apiSuccess {String} code S_Ok
   */
  static async login(ctx: Context) {
    const { username, password } = ctx.request.body;

    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    const user = await UserRepo.findOne({ where: { username } });

    if (user) {
      if (user.status === AdminUserStatus.disable) {
        let { code, msg } = RES.ADMIN_DISABLE;
        return createHttpResponse(code, msg);
      }

      let isCorrect = await comparePasword(password, user.password);
      if (isCorrect) {
        await UserRepo.update(
          {
            id: user.id
          },
          { lastLoginTime: moment().format("LLL") }
        );

        let { code, msg } = RES.SUCCESS;
        delete user.password;
        let data = {
          ...user,
          token: this.createToken({
            username
          })
        };
        return createHttpResponse(code, msg, data);
      } else {
        let { code, msg } = RES.ADMIN_ERROR_PWD;
        return createHttpResponse(code, msg);
      }
    } else {
      let { code, msg } = RES.ADMIN_USRE_NOT_EXIT;
      return createHttpResponse(code, msg, user);
    }
  }

  /**
   * @api {post} /api/admin/addUser 增加管理员
   * @apiGroup Admin
   *
   * @apiParam {String} username 用户名
   * @apiParam {Number} pasword 密码
   *
   * @apiSuccess {String} code S_Ok
   */
  static async addUser(ctx: Context) {
    const { username, password, nickname } = ctx.request.body;

    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    const user = await UserRepo.findOne({ where: { username } });

    if (user) {
      let { code, msg } = RES.ADMIN_USER_ALREADY_EXIT;
      return createHttpResponse(code, msg);
    } else {
      const cryptoPassword = await doCrypto(password);
      const newUser = UserRepo.create({
        username,
        password: cryptoPassword,
        nickname
      });

      let result = await UserRepo.save(newUser);

      let { code, msg } = RES.SUCCESS;
      delete result.password;
      return createHttpResponse(code, msg, result);
    }
  }

  /**
   * @api {post} /api/admin/deleteUser 删除管理员
   * @apiGroup Admin
   *
   * @apiParam {String} user_id 用户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async removeUser(ctx: Context) {
    const { ids } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.delete(ids);

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg);
  }

  /**
   * @api {post} /api/admin/update 更新基本信息
   * @apiGroup Admin
   *
   * @apiParam {String} user_id 用户id
   * @apiParam {Object} base_info 更新的基本信息
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateBaseInfo(ctx: Context) {
    const { id, info } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.update(id, JSON.parse(info));

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg);
  }

  /**
   * @api {post} /api/admin/resetPassword 重置密码
   * @apiGroup Admin
   *
   * @apiParam {String} id 用户id
   * @apiParam {Object} base_info 更新的基本信息
   *
   * @apiSuccess {String} code S_Ok
   */
  static async resetPassword(ctx: Context) {
    const { id } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    const password = generatePassword(true, 8, 12, false);

    const cryptoPassword = await doCrypto(password);

    await UserRepo.update(id, {
      password: cryptoPassword
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, { password });
  }

  /**
   * @api {post} /api/admin/updateStatus 重置密码
   * @apiGroup Admin
   *
   * @apiParam {String} ids 用户ids
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateUserStatus(ctx: Context) {
    const { ids, status } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.update(ids, {
      status
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg);
  }

  /**
   * @api {post} /api/admin/refund 管理员确认退款
   * @apiGroup Admin
   *
   * @apiParam {String} out_trade_no 支付订单out_trade_no
   * @apiParam {Number} total_fee
   * @apiParam {Number} refund_fee 非必填
   *
   * @apiSuccess {String} code S_Ok
   */
  static async refund(ctx: Context) {
    const {
      out_trade_no,
      out_refund_no,
      total_fee,
      refund_fee
    } = ctx.request.body;

    let result = await WxPayApi.refund({
      out_trade_no: out_trade_no,
      out_refund_no,
      total_fee,
      refund_fee: refund_fee || total_fee
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }

  /**
   * @api {post} /api/admin/refundCallback 退款通知回调
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async refundCallback(ctx) {
    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);
    const AppealRepo = this.getRepository<Appeal>(Appeal);

    let info = ctx.request.weixin;

    console.log("refund callback info", info);

    let appeal: Appeal = await AppealRepo.findOne({
      where: { out_refund_no: info.out_refund_no },
      relations: ["case", "pay"]
    });

    if (!appeal) {
      return ctx.reply("申请退款失败，无退款记录");
    }

    await AppealRepo.update(appeal.id, {
      status: AppealStatus.success
    });

    await PayOrderRepo.update(appeal.payOrder.id, {
      pay_status: PayOrderStatus.complete
    });
    await CaseOrderRepo.update(appeal.case.id, {
      status: CaseStatus.complete
    });

    return ctx.reply();
  }

  static async uploadBanner(ctx: Context) {}

  /**
   * @api {post} /api/admin/appealList 获取所有申诉列表
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getAppealList(ctx: Context) {
    let result = await getRepository(Appeal)
      .createQueryBuilder("appeal")
      .leftJoinAndSelect("appeal.case", "case")
      .leftJoinAndSelect("case.publisher", "publisher")
      .leftJoinAndSelect("appeal.payOrder", "payOrder")
      .leftJoinAndSelect("appeal.appealer", "appealer")
      .getMany();

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }

  /**
   * @api {post} /api/admin/userList 获取所有用户列表
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getUserList(ctx: Context) {
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);
    const result = await UserRepo.find();
    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }

  static async getClientVerifyUserList(ctx: Context) {
    const ClientUser = this.getRepository<User>(User);

    const result = await ClientUser.find({
      where: { verify_status: UserVerifyStatus.applyVerify }
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }
}
