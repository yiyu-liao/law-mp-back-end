import { Context } from "koa";
import tenPay = require("@src/shared/lib/index");
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

import * as Config from "../../config/config.json";
import User from "@src/entity/user.ts";
import Appeal from "@src/entity/case-appeal";
import Balance from "@src/entity/user-balance";
import HttpException from "@src/shared/http-exception";

import * as fs from "fs";
import * as path from "path";

import WxService from "./wx";

const pfxPath = path.join(__dirname, "../../pfx/apiclient_cert.p12");
const pfx = fs.readFileSync(pfxPath);

import * as util from "@src/shared/payUtil";

export default class OrderService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  static async initWxPay() {
    // @ts-ignore
    const payApi = new tenPay({
      appid: Config["wx"].appid,
      mchid: Config["wx"].mchid,
      partnerKey: Config["wx"].partnerKey,
      pfx,
      notify_url: "https://huaronghr.com/api/order/payCallback",
      refund_url: "https://huaronghr.com/api/order/refundCallback"
    });

    return payApi;
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

    const payApi = await this.initWxPay();

    let result = await payApi.getPayParams({
      out_trade_no,
      body,
      total_fee,
      openid
    });

    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);

    let targetCase = new Case();
    targetCase.id = case_id;
    // targetCase.select_lawyer_id = select_lawyer_id;
    await CaseOrderRepo.update(case_id, {
      select_lawyer_id
    });

    // TO Review: review 新建PayOrder是否有意义
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
    const UserRepo = this.getRepository<User>(User);

    let info = ctx.request.weixin;

    console.log("callback info", info);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no: info.out_trade_no },
      relations: ["case"]
    });

    if (!payOrder) {
      return ctx.reply("付款失败，无订单记录");
    }

    const { total_fee, pay_status } = payOrder;

    if (Number(total_fee) !== Number(info.total_fee)) {
      return ctx.reply("付款金额有误，请重新支付");
    }

    if (pay_status === PayOrderStatus.success) {
      return ctx.reply();
    }

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.success
    });
    await CaseOrderRepo.update(payOrder.case.id, {
      status: CaseStatus.processing
    });

    const { select_lawyer_id, case_type } = payOrder.case;

    const caseType =
      (case_type === 1 && "文书起草") ||
      (case_type === 2 && "案件委托") ||
      (case_type === 3 && "法律顾问") ||
      (case_type === 3 && "案件查询");

    const lawyerInfo = await UserRepo.findOne(select_lawyer_id);

    await WxService.sendCaseStatusUpdate({
      caseStatus: "客户已完成支付",
      comment: `[${caseType}]报价抢单成功，请及时处理`,
      touser: lawyerInfo.openid,
      page: "/"
    });

    return ctx.reply();
  }

  /**
   * @api {post} /order/refundCallback 退款通知回调
   * @apiGroup Admin
   *
   * @apiSuccess {String} code S_Ok
   */
  static async refundCallback(ctx) {
    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);
    const AppealRepo = this.getRepository<Appeal>(Appeal);
    const UserRepo = this.getRepository<User>(User);

    let info = ctx.request.weixin;

    const xmlData = info.req_info;

    console.log("refund callback info", info);

    let appeal: Appeal = await AppealRepo.findOne({
      where: { out_refund_no: xmlData.out_refund_no },
      relations: ["case", "payOrder", "case.publisher"]
    });

    if (!appeal) {
      return ctx.reply("申请退款失败，无退款记录");
    }

    await AppealRepo.update(appeal.id, {
      status: AppealStatus.agree
    });

    const { payOrder } = appeal;

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.cancel
    });
    await CaseOrderRepo.update(appeal.case.id, {
      status: CaseStatus.cancel
    });

    const case_type = appeal.case.case_type;
    const caseType =
      (case_type === 1 && "文书起草") ||
      (case_type === 2 && "案件委托") ||
      (case_type === 3 && "法律顾问") ||
      (case_type === 3 && "案件查询");

    await WxService.sendCaseStatusUpdate({
      caseStatus: "申诉成功",
      comment: `[${caseType}]申诉成功，所支付费用已退回钱包。`,
      touser: appeal.case.publisher.openid,
      page: "/"
    });

    const relateLawer = await UserRepo.findOne(appeal.case.select_lawyer_id);

    await WxService.sendCaseStatusUpdate({
      caseStatus: "客户申诉成功",
      comment: `[${caseType}]客户申诉成功, 订单已取消。`,
      touser: relateLawer.openid,
      page: "/"
    });

    return ctx.reply();
  }

  /**
   * @api {post} /order/applyRefund 用户申诉
   * @apiName applyRefund
   * @apiGroup WxPay
   *
   * @apiParam {String} case_id 案件id
   * @apiParam {String} appealer_id 申诉人id
   * @apiParam {String} reason 申诉理由
   *
   * @apiSuccess {String} code S_Ok
   */
  static async applyRefund(ctx: Context) {
    const { case_id, appealer_id, reason, url_route } = ctx.request.body;

    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);
    const UserRepo = this.getRepository<User>(User);
    const AppealRepo = this.getRepository<Appeal>(Appeal);

    // let payOrder: PayOrder = await PayOrderRepo.findOne({
    //   where: { out_trade_no },
    //   relations: ["case"]
    // });
    // await PayOrderRepo.update(payOrder.id, {
    //   pay_status: PayOrderStatus.appeal
    // });

    let payOrder = await getRepository(PayOrder)
      .createQueryBuilder("order")
      .where("order.case_id = :case_id", { case_id })
      .getOne();

    await CaseOrderRepo.update(case_id, {
      status: CaseStatus.appeal
    });

    let refundCase = await CaseOrderRepo.findOne(case_id);
    let appealer = await UserRepo.findOne(appealer_id);

    let appealOrder = AppealRepo.create({
      out_refund_no: generateTradeNumber(),
      reason,
      payOrder,
      case: refundCase,
      appealer
    });

    await AppealRepo.save(appealOrder);

    const { select_lawyer_id, case_type } = refundCase;

    const lawyerInfo = await UserRepo.findOne(select_lawyer_id);
    const caseType =
      (case_type === 1 && "文书起草") ||
      (case_type === 2 && "案件委托") ||
      (case_type === 3 && "法律顾问") ||
      (case_type === 3 && "案件查询");
    await WxService.sendCaseStatusUpdate({
      caseStatus: "客户发起申诉，等待后台管理员审核情况",
      comment: `[${caseType}]${reason}`,
      touser: lawyerInfo.openid,
      page: url_route
    });

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
   * @apiParam {String} lawyer_id 申请人id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async applyWithdrawal(ctx: Context) {
    const { apply_fee, lawyer_id } = ctx.request.body;

    const UserrRepo = this.getRepository<User>(User);
    const BalanceRepo = this.getRepository<Balance>(Balance);

    let lawyer = await UserrRepo.findOne(lawyer_id, {
      relations: ["extra_profile"]
    });

    let lawyerBalance = await BalanceRepo.findOne({
      where: { ownerId: lawyer_id }
    });
    let { id: balanceId, totalBalance } = lawyerBalance;

    if (Number(totalBalance) < Number(apply_fee)) {
      throw new HttpException({
        code: Res.BALANCE_INSUFFICIENT.code,
        message: Res.BALANCE_INSUFFICIENT.msg
      });
    }

    const payApi = await this.initWxPay();

    let result = payApi.transfers({
      partner_trade_no: generateTradeNumber(),
      openid: lawyer.openid,
      re_user_name: lawyer.real_name,
      amount: apply_fee,
      desc: "提现申请"
    });

    await BalanceRepo.update(balanceId, {
      totalBalance: Number(totalBalance) - Number(apply_fee)
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
    const BalanceRepo = this.getRepository<Balance>(Balance);
    const relatedCase = this.getRepository<Case>(Case);
    const UserRepo = this.getRepository<User>(User);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no },
      relations: ["case"]
    });
    const targetLawyerId = payOrder.case.select_lawyer_id;
    const orderIncome = payOrder.total_fee;

    let lawyerBalance = await BalanceRepo.findOne({
      where: { ownerId: targetLawyerId }
    });

    let { id: balanceId, totalBalance } = lawyerBalance;

    await BalanceRepo.update(balanceId, {
      totalBalance: Number(totalBalance) + Number(orderIncome)
    });

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.complete
    });

    await relatedCase.update(payOrder.case.id, {
      status: CaseStatus.complete
    });

    const { openid } = await UserRepo.findOne(payOrder.case.select_lawyer_id);
    const { case_type } = payOrder.case;

    const caseType =
      (case_type === 1 && "文书起草") ||
      (case_type === 2 && "案件委托") ||
      (case_type === 3 && "法律顾问") ||
      (case_type === 3 && "案件查询");
    await WxService.sendCaseStatusUpdate({
      caseStatus: "客户已确认订单",
      comment: `[${caseType}]涉及律师费用更新到钱包`,
      touser: openid,
      page: "/"
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

    const wxPayApi = await this.initWxPay();

    let result = await wxPayApi.orderQuery({
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
   * @apiParam {String} customer_id 客户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerOrderList(ctx: Context) {
    const { customer_id } = ctx.request.body;

    let result = await getRepository(PayOrder)
      .createQueryBuilder("order")
      .innerJoinAndSelect(
        "order.case",
        "case",
        "case.publisher_id := customer_id",
        {
          customer_id
        }
      )
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
   * @apiParam {String} lawyer_id 律师id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getLawyerOrderList(ctx: Context) {
    const { lawyer_id } = ctx.request.body;

    let result = await getRepository(PayOrder)
      .createQueryBuilder("order")
      .innerJoinAndSelect(
        "order.case",
        "case",
        "case.select_lawyer_id := lawyer_id",
        { lawyer_id }
      )
      .getMany();

    return {
      code: Res.SUCCESS.code,
      data: result,
      msg: Res.SUCCESS.msg
    };
  }
}
