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
  static async agreeAppealCase(ctx) {
    ctx.body = await AdminService.agreeAppealCase(ctx);
  }
  static async rejectAppealCase(ctx) {
    ctx.body = await AdminService.rejectAppealCase(ctx);
  }
  static async getUserList(ctx) {
    ctx.body = await AdminService.getUserList(ctx);
  }
  static async refund(ctx) {
    ctx.body = await AdminService.refund(ctx);
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
  static async getSwiperImages(ctx) {
    ctx.body = await AdminService.getSwiperImages();
  }
  static async updateSwiperImage(ctx) {
    ctx.body = await AdminService.updateSwiperImages(ctx);
  }

  static async getMenusById(ctx) {
    ctx.body = await AdminService.getMenusById(ctx);
  }
  static async getPowerById(ctx) {
    ctx.body = await AdminService.getPowerById(ctx);
  }
  static async getRoleById(ctx) {
    ctx.body = await AdminService.getRoleById(ctx);
  }
}
