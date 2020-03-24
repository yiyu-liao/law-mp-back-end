import PayService from "@src/service/pay";

export default class OrderController {
  static async getPayParams(ctx) {
    ctx.body = await PayService.getPayParams(ctx);
  }
  static async payNoticeCallback(ctx) {
    ctx.body = await PayService.payCallback(ctx);
  }
  static async refundNoticeCallback(ctx) {
    ctx.body = await PayService.refundCallback(ctx);
  }
  static async applyRefund(ctx) {
    ctx.body = await PayService.applyRefund(ctx);
  }
  static async applyWithdrawal(ctx) {
    ctx.body = await PayService.applyWithdrawal(ctx);
  }
}
