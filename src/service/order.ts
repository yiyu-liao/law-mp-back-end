import { Context } from "koa";
import tenPay = require("tenpay");
import {
  ResponseCode as Res,
  PayOrderStatus,
  CaseStatus,
  AppealStatus
} from "@src/constant";
import { generateTradeNumber } from "@src/shared";

import { getManager, Repository, getRepository } from "typeorm";

import PayOrder from "@src/entity/case-order";
import Case from "@src/entity/case";

import * as Config from "../../config.js";
import User from "@src/entity/user.ts";
import Appeal from "@src/entity/case-appeal";
import HttpException from "@src/shared/http-exception";
import Lawyer from "@src/entity/lawyer.ts";

export const WxPayApi = new tenPay({
  appid: Config.appid,
  mchid: Config.mchid,
  partnerKey: Config.partnerKey,
  pfx: "",
  notify_url: "",
  refund_url: ""
});

export default class PayService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
   * @api {post} /order/getPayParams 获取支付参数
   * @apiName getPayParams
   * @apiGroup WxPay
   *
   * @apiParam {String} body 支付case简单描述
   * @apiParam {Number} total_fee 支付金额，单位为分，如需支付0.1元，total_fee为100
   * @apiParam {String} openid 当前支付用户openid
   * @apiParam {String} select_lawyer_id 选中律师openid
   * @apiParam {Number} case_id 当前支付订单case_id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getPayParams(ctx: Context) {
    let {
      body,
      total_fee,
      openid,
      case_id,
      select_lawyer_id
    } = ctx.request.body;
    const out_trade_no = generateTradeNumber();
    let result = await WxPayApi.getPayParams({
      out_trade_no,
      body: body,
      total_fee,
      openid
    });

    if (result.result_code === "SUCCESS") {
      const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
      const CaseOrderRepo = this.getRepository<Case>(Case);

      let targetCase = new Case();
      targetCase.id = case_id;
      targetCase.select_lawyer_id = select_lawyer_id;
      await CaseOrderRepo.save(targetCase);

      const pay = PayOrderRepo.create({
        out_trade_no,
        case: targetCase,
        total_fee
      });
      await PayOrderRepo.save(pay);

      return {
        code: Res.SUCCESS.code,
        data: result,
        msg: Res.SUCCESS.msg
      };
    } else {
      return {
        code: Res.PAY_SIGN_ERROR.code,
        msg: Res.PAY_SIGN_ERROR.msg
      };
    }
  }

  /**
   * @api {post} /order/payCallback 支付成功回调
   * @apiName payCallback
   * @apiGroup WxPay
   * @apiSuccess {String} code S_Ok
   */
  static async payCallback(ctx) {
    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);

    let info = ctx.request.weixin;

    console.log("notice pay callback info", info);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no: info.out_trade_no },
      relations: ["case"]
    });

    if (!payOrder) {
      return ctx.reply("付款失败，无订单记录");
    }

    if (payOrder.total_fee !== info.total_fee) {
      return ctx.reply("付款金额有误，请重新支付");
    }

    if (payOrder.pay_status === PayOrderStatus.success) {
      return ctx.reply();
    }

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.success
    });
    await CaseOrderRepo.update(payOrder.case.id, {
      status: CaseStatus.pending
    });

    // TODO: send message to lawyer client

    return ctx.reply();
  }

  /**
   * @api {post} /order/applyRefund 用户申诉
   * @apiName applyRefund
   * @apiGroup WxPay
   *
   * @apiParam {String} out_trade_no 支付订单out_trade_no
   * @apiParam {String} appealer_id 申诉人uid
   * @apiParam {String} appealer_reason 申诉理由
   *
   * @apiSuccess {String} code S_Ok
   */
  static async applyRefund(ctx: Context) {
    const { out_trade_no, appealer_id, appeal_reason } = ctx.request.body;

    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);
    const UserRepo = this.getRepository<User>(User);
    const AppealRepo = this.getRepository<Appeal>(Appeal);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no },
      relations: ["case"]
    });
    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.appeal
    });
    await CaseOrderRepo.update(payOrder.case.id, {
      status: CaseStatus.appeal
    });

    let appealer = await UserRepo.findOne(appealer_id);

    let appealOrder = AppealRepo.create({
      appeal_reason,
      payOrder: payOrder,
      appealer
    });

    await AppealRepo.save(appealOrder);

    return {
      code: Res.SUCCESS.code,
      data: {},
      message: Res.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/withdrawal 律师申请提现
   * @apiName withdrawal
   * @apiGroup WxPay
   *
   * @apiParam {Number} apply_fee 申请提现金额
   * @apiParam {String} lawyer_id 申请人uid
   *
   * @apiSuccess {String} code S_Ok
   */
  static async applyWithdrawal(ctx: Context) {
    const { apply_fee, lawyer_id } = ctx.request.body;

    const UserrRepo = this.getRepository<User>(User);
    const ExtraProfileRepo = this.getRepository<Lawyer>(Lawyer);

    let lawyer = await UserrRepo.findOne(lawyer_id, {
      relations: ["extra_profile"]
    });

    if (Number(lawyer.extra_profile.balance) * 0.9 < Number(apply_fee)) {
      throw new HttpException({
        code: Res.BALANCE_INSUFFICIENT.code,
        message: Res.BALANCE_INSUFFICIENT.msg
      });
    }

    let result = await WxPayApi.transfers({
      partner_trade_no: generateTradeNumber(),
      openid: lawyer.uid,
      re_user_name: lawyer.real_name,
      amount: apply_fee,
      desc: "提现申请"
    });

    let { id, balance: preBalance } = lawyer.extra_profile;

    await ExtraProfileRepo.update(id, {
      balance: preBalance - apply_fee
    });

    return {
      code: Res.SUCCESS.code,
      data: result,
      message: Res.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/confirmOrder 用户确认订单
   * @apiName confirmOrder
   * @apiGroup WxPay
   *
   * @apiParam {out_trade_no} out_trade_no 支付订单out_trade_no
   *
   * @apiSuccess {String} code S_Ok
   */
  static async confirmOrder(ctx: Context) {
    const { out_trade_no } = ctx.request.body;
    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const UserRepo = this.getRepository<User>(User);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no },
      relations: ["case"]
    });
    const targetLawyerId = payOrder.case.select_lawyer_id;
    const orderIncome = payOrder.total_fee;

    let user: User = await UserRepo.findOne(targetLawyerId, {
      relations: ["extra_profile"]
    });

    user.extra_profile.balance += orderIncome;

    await UserRepo.save(user);

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.complete
    });

    return {
      code: Res.SUCCESS.code,
      data: null,
      message: Res.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/query 查询支付订单状态
   * @apiName query
   * @apiGroup WxPay
   *
   * @apiParam {String} out_trade_no 支付订单out_trade_no
   *
   * @apiSuccess {String} code S_Ok
   */
  static async orderQuery(ctx: Context) {
    const { out_trade_no } = ctx.request.body;

    let result = await WxPayApi.orderQuery({
      out_trade_no
    });

    return {
      code: Res.SUCCESS.code,
      data: result,
      message: Res.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/customerOrderList 客户支付订单列表
   * @apiName customerOrderList
   * @apiGroup WxPay
   *
   * @apiParam {String} uid 客户uid
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerOrderList(ctx: Context) {
    const { uid } = ctx.request.body;

    let result = await getRepository(PayOrder)
      .createQueryBuilder("order")
      .innerJoinAndSelect("order.case", "case", "case.publisher_id := uid", {
        uid
      })
      .getMany();

    return {
      code: Res.SUCCESS.code,
      data: result,
      msg: Res.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/lawyerOrderList 律师支付订单列表
   * @apiName lawyerOrderList
   * @apiGroup WxPay
   *
   * @apiParam {String} uid 律师uid
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getLawyerOrderList(ctx: Context) {
    const { uid } = ctx.request.body;

    let result = await getRepository(PayOrder)
      .createQueryBuilder("order")
      .innerJoinAndSelect(
        "order.case",
        "case",
        "case.select_lawyer_id := uid",
        { uid }
      )
      .getMany();

    return {
      code: Res.SUCCESS.code,
      data: result,
      msg: Res.SUCCESS.msg
    };
  }
}
