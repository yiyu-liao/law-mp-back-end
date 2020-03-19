import { Context } from "koa";
import tenPay from "tenpay";
import { randomWord } from "@src/utils/tool";
import { ResponseCode } from "@src/constant";

export default class PayService {
  readonly tenPay = new tenPay();

  static async getPayParams(ctx: Context) {
    let { body, total_fee, openid } = ctx.request.body;
    const out_trade_no = new Date().getTime() + randomWord(false, 6, 0);
    let result = await tenPay.getPayParams({
      out_trade_no,
      body: body,
      total_fee: total_fee,
      openid
    });
    if (result.result_code === "SUCCESS") {
    }
    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      messag: ResponseCode.SUCCESS.msg
    };
  }

  static async receivePayNotice(ctx) {
    /* tslint:disable */
    let info = ctx.req.weixin;

    ctx.res.reply();
  }

  static async refund() {}

  static async transfers() {}
}
