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
}
