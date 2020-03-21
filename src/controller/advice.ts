import AdviceService from "@src/service/advice";

export default class UserController {
  static async getCustomerAllAdvices(ctx) {
    ctx.body = await AdviceService.getCustomerAllAdvices(ctx);
  }
  static async publishAdvice(ctx) {
    ctx.body = await AdviceService.publishAdvice(ctx);
  }

  static async replyAdvice(ctx) {
    ctx.body = await AdviceService.replyAdvice(ctx);
  }

  static async getAdviceDetail(ctx) {
    ctx.body = await AdviceService.getAdviceDetail(ctx);
  }

  static async getAllAdvices(ctx) {
    ctx.body = await AdviceService.getAllAdvices(ctx);
  }

  static async getAdivicesRelateReplyUser(ctx) {
    ctx.body = await AdviceService.getAdivicesRelateReplyUser(ctx);
  }
}
