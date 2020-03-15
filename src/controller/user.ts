import UserService from "../service/user";

export default class UserController {
  static async authSession(ctx) {
    ctx.body = await UserService.authSession(ctx);
  }
  static async updateUser(ctx) {
    ctx.body = await UserService.updateUserInfo(ctx);
  }
  static async getUserInfo(ctx) {
    ctx.body = await UserService.getUserInfo(ctx);
  }
  static async getUserRelateReply(ctx) {
    ctx.body = await UserService.getUserRelateReply(ctx);
  }
}
