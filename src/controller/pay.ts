import PayService from "@src/service/pay";

export default class OrderController {
  static async getPayParams(ctx) {
    ctx.body = await PayService.getPayParams(ctx);
  }
}
