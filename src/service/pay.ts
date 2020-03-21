import { Context } from "koa";
import tenPay = require("tenpay");
import { ResponseCode as Res, PayOrderStatus, CaseStatus } from "@src/constant";
import { generateTradeNumber } from "@src/shared";

import { getManager, Repository, getRepository } from "typeorm";

import PayOrder from "@src/entity/pay-order";
import Case from "@src/entity/case";

import * as Config from "../../config.js";

export default class PayService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  static async getPayParams(ctx: Context) {
    const PayApi = new tenPay({
      appid: Config.appid,
      mchid: Config.mchid,
      partnerKey: Config.partnerKey,
      pfx: "",
      notify_url: "",
      refund_url: ""
    });

    let {
      body,
      total_fee,
      openid,
      case_id,
      select_lawyer_id
    } = ctx.request.body;
    const out_trade_no = generateTradeNumber();
    let result = await PayApi.getPayParams({
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

  static async payNoticeCallback(req, res) {
    const PayOrderRepo = this.getRepository<PayOrder>(PayOrder);
    const CaseOrderRepo = this.getRepository<Case>(Case);

    let info = req.weixin;

    console.log("notice pay callback info", info);

    let payOrder: PayOrder = await PayOrderRepo.findOne({
      where: { out_trade_no: info.out_trade_no },
      relations: ["case"]
    });

    if (!payOrder) {
      return res.reply("付款失败，无订单记录");
    }

    if (payOrder.total_fee !== info.total_fee) {
      return res.reply("付款金额有误，请重新支付");
    }

    if (payOrder.pay_status === PayOrderStatus.success) {
      return res.reply();
    }

    await PayOrderRepo.update(payOrder.id, {
      pay_status: PayOrderStatus.success
    });
    await CaseOrderRepo.update(payOrder.case.id, {
      status: CaseStatus.pending
    });

    // TODO: send message to lawyer client

    return res.reply();
  }

  static async refundNoticeCallback() {}

  static async transfers() {}
}
