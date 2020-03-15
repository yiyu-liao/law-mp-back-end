import LegalAdviceService from "@src/service/legal-advice";

export default class UserController {
  static async getCustomerAllAdvices(ctx) {
    ctx.body = await LegalAdviceService.getCustomerAllAdvices(ctx);
  }
  static async publishAdvice(ctx) {
    ctx.body = await LegalAdviceService.publishAdvice(ctx);
  }

  static async replyAdvice(ctx) {
    ctx.body = await LegalAdviceService.replyAdvice(ctx);
  }

  static async getAdviceDetail(ctx) {
    ctx.body = await LegalAdviceService.getAdviceDetail(ctx);
  }

  static async getAllAdvices(ctx) {
    ctx.body = await LegalAdviceService.getAllAdvices(ctx);
  }
}
