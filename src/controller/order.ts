import OrderServer from "@src/service/case";

export default class OrderController {
  static async publicCase(ctx) {
    ctx.body = await OrderServer.publicCase(ctx);
  }
  static async bidCase(ctx) {
    ctx.body = await OrderServer.bidCase(ctx);
  }
  static async selectBidder(ctx) {
    ctx.body = await OrderServer.selectBidder(ctx);
  }
  static async getCaseDetail(ctx) {
    ctx.body = await OrderServer.getCaseDetail(ctx);
  }
  static async changeOrderStatus(ctx) {
    ctx.body = await OrderServer.changeOrderStatus(ctx);
  }
  static async getCaseList(ctx) {
    ctx.body = await OrderServer.getCaseList(ctx);
  }
  static async getCustomerList(ctx) {
    ctx.body = await OrderServer.getCustomerList(ctx);
  }
  static async getLawyerList(ctx) {
    ctx.body = await OrderServer.getLawyerList(ctx);
  }
}
