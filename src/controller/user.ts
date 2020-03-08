import UserService from "../service/user";

export default class UserController {
  static async authSession(ctx) {
    ctx.body = await UserService.authSession(ctx);
  }
  static async register(ctx) {
    ctx.body = await UserService.register(ctx);
  }
  static async getUserInfo(ctx) {
    ctx.body = await UserService.getUserInfo(ctx);
  }
}
