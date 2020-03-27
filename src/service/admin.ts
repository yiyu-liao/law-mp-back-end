import { Context } from "koa";
import { getManager, Repository, getRepository, MoreThan } from "typeorm";
import UserAdmin from "@src/entity/user-admin";
import User from "@src/entity/user.ts";
import Appeal from "@src/entity/case-appeal";
import PayOrder from "@src/entity/case-order";
import Case from "@src/entity/case";
import Balance from "@src/entity/user-balance";
import {
  UserVerifyStatus,
  AdminMenu,
  AdminPower,
  AdminRole,
  ResponseCode as RES,
  PayOrderStatus,
  CaseStatus,
  AppealStatus,
  AdminUserStatus
} from "@src/constant";

import * as dayjs from "dayjs";
dayjs.locale();

import OrderService from "@src/service/order";

import WxService from "./wx";

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

  static createToken(data): string {
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
      if (user.conditions === AdminUserStatus.disable) {
        let { code, msg } = RES.ADMIN_DISABLE;
        return createHttpResponse(code, msg);
      }

      let isCorrect = await comparePasword(password, user.password);

      if (isCorrect) {
        await UserRepo.update(
          {
            id: user.id
          },
          { lastLoginTime: dayjs().format("LLL") }
        );

        let { code, msg } = RES.SUCCESS;
        delete user.password;
        let data = {
          ...user,
          token: this.createToken({ username })
        };
        return createHttpResponse(code, msg, data, 200);
      } else {
        let { code, msg } = RES.ADMIN_ERROR_PWD;
        return createHttpResponse(code, msg);
      }
    } else {
      let { code, msg } = RES.ADMIN_USRE_NOT_EXIT;
      return createHttpResponse(code, msg, user);
    }
  }

  static async getRoleById(ctx: Context) {
    const { id } = ctx.request.body;

    let res = AdminRole;

    let { code, msg } = RES.SUCCESS;

    return createHttpResponse(code, msg, res, 200);
  }

  static async getPowerById(ctx: Context) {
    const { params: p } = ctx.request.body;

    let res = AdminPower;

    let { code, msg } = RES.SUCCESS;

    return createHttpResponse(code, msg, res, 200);
  }

  static async getMenusById(ctx: Context) {
    const { params: p } = ctx.request.body;

    let res = AdminMenu;
    // if (p.id instanceof Array) {
    //   res = AdminMenu.filter(function (item) {
    //     return p.id.includes(item.id);
    //   });
    // } else {
    //   const t = AdminMenu.find(function (item) {
    //     return item.id === p.id;
    //   });
    //   res.push(t);
    // }
    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, res, 200);
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
    const params: UserAdmin = ctx.request.body;

    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    const user = await UserRepo.findOne({
      where: { username: params.username }
    });

    if (user) {
      let { code, msg } = RES.ADMIN_USER_ALREADY_EXIT;
      return createHttpResponse(code, msg);
    } else {
      const cryptoPassword = await doCrypto(params.password);
      const newUser = UserRepo.create({
        ...params,
        password: cryptoPassword,
        roles: [1]
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
    const { id } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.delete(id);

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg);
  }

  /**
   * @api {post} /api/admin/updateBaseInfo 更新基本信息
   * @apiGroup Admin
   *
   * @apiParam {String} user_id 用户id
   * @apiParam {Object} base_info 更新的基本信息
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateBaseInfo(ctx: Context) {
    const params = ctx.request.body;

    const id: string = params.id;

    delete params.id;

    const { password } = params;

    if (password) {
      const cryptoPassword = await doCrypto(password);
      params.password = cryptoPassword;
    }

    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.update(id, params);

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
   * @api {post} /api/admin/updateStatus 改变用户状态
   * @apiGroup Admin
   *
   * @apiParam {String} ids 用户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateUserStatus(ctx: Context) {
    const { id, conditions } = ctx.request.body;
    const UserRepo = this.getRepository<UserAdmin>(UserAdmin);

    await UserRepo.update(id, {
      conditions
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

    const wxPayApi = await OrderService.initWxPay();

    let result = await wxPayApi.refund({
      out_trade_no: out_trade_no,
      out_refund_no,
      total_fee,
      refund_fee: refund_fee || total_fee
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
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
   * @api {post} /api/admin/agreeAppeal 同意申诉
   * @apiParam {Number} appeal_id
   * @apiParam {Number} client_id
   * @apiParam {Number} lawyer_id
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async agreeAppealCase(ctx: Context) {
    const { appeal_id, client_id, lawyer_id } = ctx.request.body;
    const AppealRepo = this.getRepository<Appeal>(Appeal);

    const appealInfo = <Appeal>await AppealRepo.findOne(appeal_id, {
      relations: ["payOrder"]
    });
    const { payOrder, out_refund_no } = appealInfo;
    let { out_trade_no, total_fee } = payOrder;

    const wxPayApi = await OrderService.initWxPay();

    let result = await wxPayApi.refund({
      out_trade_no,
      out_refund_no: out_refund_no,
      total_fee,
      refund_fee: total_fee /* 全额退款 */
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }

  /**
   * @api {post} /api/admin/rejectCase 拒绝申诉
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async rejectAppealCase(ctx: Context) {
    const {
      appeal_id,
      case_id,
      changeStatus,
      rejectReson,
      client_id,
      lawyer_id
    } = ctx.request.body;

    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);
    const AppealRepo = this.getRepository<Appeal>(Appeal);
    const BalanceRepo = this.getRepository<Balance>(Balance);
    const UserRepo = this.getRepository<User>(User);

    const appealInfo = <Appeal>await AppealRepo.findOne(appeal_id, {
      relations: ["payOrder"]
    });
    const { payOrder } = appealInfo;
    let { total_fee } = payOrder;

    await AppealRepo.update(appeal_id, {
      status: AppealStatus.reject,
      rejectReson: rejectReson
    });

    payOrder &&
      (await PayOrderRepo.update(payOrder.id, {
        pay_status: PayOrderStatus.cancel
      }));

    await CaseOrderRepo.update(case_id, {
      status: changeStatus
    });

    /* 更新律师钱包 */
    if (changeStatus === CaseStatus.cancel) {
      const balance = await BalanceRepo.findOne(lawyer_id);
      await BalanceRepo.update(lawyer_id, {
        totalBalance: Number(balance.totalBalance) + Number(total_fee || 0)
      });
    }

    const clientUserInfo = await UserRepo.findOne(client_id);
    const lawyerUserInfo = await UserRepo.findOne(lawyer_id);

    await WxService.sendRefundResultFeedback({
      orderNo: payOrder.out_trade_no,
      touser: clientUserInfo.openid,
      reason: rejectReson,
      comment:
        changeStatus === CaseStatus.processing
          ? "申诉失败，律师将为您继续服务"
          : "申诉失败，订单已取消，所支付的费用已转到律师账户。",
      page: "/"
    });

    await WxService.sendRefundResultFeedback({
      orderNo: payOrder.out_trade_no,
      touser: lawyerUserInfo.openid,
      reason: rejectReson,
      comment:
        changeStatus === CaseStatus.processing
          ? "客户申诉失败，您将为客户继续服务"
          : "客户申诉失败，订单已取消，所支付的费用已转到您账户。",
      page: "/"
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg);
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
      where: { verify_status: MoreThan(1) },
      relations: ["extra_profile"]
    });

    let { code, msg } = RES.SUCCESS;
    return createHttpResponse(code, msg, result);
  }
}
