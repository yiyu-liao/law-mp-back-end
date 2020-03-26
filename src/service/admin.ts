import { Context } from "koa";
import { getManager, Repository, getRepository } from "typeorm";
import UserAdmin from "@src/entity/user-admin";
import User from "@src/entity/user.ts";
import Appeal from "@src/entity/case-appeal";
import PayOrder from "@src/entity/case-order";
import Case from "@src/entity/case";

import {
  ResponseCode as RES,
  PayOrderStatus,
  CaseStatus,
  AppealStatus
} from "@src/constant";

import { WxPayApi } from "./order";

import {
  createHttpResponse,
  doCrypto,
  comparePasword,
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
      let isCorrect = comparePasword(password, user.password);

      if (isCorrect) {
        let { code, msg } = RES.SUCCESS;
        let data = {
          token: this.createToken({
            username
          })
        };
        return createHttpResponse(code, msg, data);
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
    const { username, password } = ctx.request.body;

    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    const user = await UserRepo.findOne({ where: { username } });

    if (user) {
      let { code, msg } = RES.ADMIN_USER_ALREADY_EXIT;
      return createHttpResponse(code, msg);
    } else {
      const cryptoPassword = await doCrypto(password);
      const newUser = UserRepo.create({
        username,
        password: cryptoPassword
      });

      UserRepo.save(newUser);

      let { code, msg } = RES.SUCCESS;
      return createHttpResponse(code, msg);
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
    const { user_id } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    let deleteUser = UserRepo.create({
      id: user_id
    });

    await UserRepo.remove(deleteUser);

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
    const { out_trade_no, total_fee, refund_fee } = ctx.request.body;

    let result = await WxPayApi.refund({
      out_trade_no: out_trade_no,
      out_refund_no: generateTradeNumber(),
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
      pay_status: PayOrderStatus.cancel
    });
    await CaseOrderRepo.update(appeal.case.id, {
      status: CaseStatus.cancel
    });

    return ctx.reply();
  }

  static async resetPassword(ctx: Context) {}

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
}
