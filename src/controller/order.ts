import OrderService from "@src/service/order";

export default class OrderController {
  static async getPayParams(ctx) {
    ctx.body = await OrderService.getPayParams(ctx);
  }
  static async payNoticeCallback(ctx) {
    ctx.body = await OrderService.payCallback(ctx);
  }
  static async applyRefund(ctx) {
    ctx.body = await OrderService.applyRefund(ctx);
  }
  static async applyWithdrawal(ctx) {
    ctx.body = await OrderService.applyWithdrawal(ctx);
  }
  static async orderQuery(ctx) {
    ctx.body = await OrderService.orderQuery(ctx);
  }
  static async confirmOrder(ctx) {
    ctx.body = await OrderService.confirmOrder(ctx);
  }
  static async getCustomerOrderList(ctx) {
    ctx.body = await OrderService.getCustomerOrderList(ctx);
  }
  static async getLawyerOrderList(ctx) {
    ctx.body = await OrderService.getLawyerOrderList(ctx);
  }
}
