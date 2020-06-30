import CaseService from "@src/service/case";

export default class OrderController {
  static async publicCase(ctx) {
    ctx.body = await CaseService.publicCase(ctx);
  }
  static async bidCase(ctx) {
    ctx.body = await CaseService.bidCase(ctx);
  }
  static async updateBidPrice(ctx) {
    ctx.body = await CaseService.updateBidPrice(ctx);
  }
  static async cancelBid(ctx) {
    ctx.body = await CaseService.cancelBid(ctx);
  }
  static async getCaseDetail(ctx) {
    ctx.body = await CaseService.getCaseDetail(ctx);
  }
  static async getCaseList(ctx) {
    ctx.body = await CaseService.getCaseList(ctx);
  }
  static async getCustomerList(ctx) {
    ctx.body = await CaseService.getCustomerList(ctx);
  }
  static async getLawyerList(ctx) {
    ctx.body = await CaseService.getLawyerList(ctx);
  }
  static async getLawyerBidCaseList(ctx) {
    ctx.body = await CaseService.getLawyerBidCaseList(ctx);
  }
  static async updateCaseInfo(ctx) {
    ctx.body = await CaseService.updateCaseInfo(ctx);
  }
}
