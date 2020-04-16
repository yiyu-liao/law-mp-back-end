import AdminService from "@src/service/admin";

export default class UserController {
  static async login(ctx) {
    ctx.body = await AdminService.login(ctx);
  }
  static async addUser(ctx) {
    ctx.body = await AdminService.addUser(ctx);
  }
  static async deleteUser(ctx) {
    ctx.body = await AdminService.removeUser(ctx);
  }
  static async getAppealList(ctx) {
    ctx.body = await AdminService.getAppealList(ctx);
  }
  static async getUserList(ctx) {
    ctx.body = await AdminService.getUserList(ctx);
  }
  static async refund(ctx) {
    ctx.body = await AdminService.refund(ctx);
  }
  static async refundCallback(ctx) {
    ctx.body = await AdminService.refundCallback(ctx);
  }
  static async resetPassword(ctx) {
    ctx.body = await AdminService.resetPassword(ctx);
  }
  static async updateStatus(ctx) {
    ctx.body = await AdminService.updateUserStatus(ctx);
  }
  static async updateBaseInfo(ctx) {
    ctx.body = await AdminService.updateBaseInfo(ctx);
  }
  static async clientVerifyUserList(ctx) {
    ctx.body = await AdminService.getClientVerifyUserList(ctx);
  }
}
