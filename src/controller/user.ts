import UserService from "../service/user";

export default class UserController {
  static async login(ctx) {
    ctx.body = await UserService.login(ctx);
  },
  static async register(ctx) {
    ctx.body = await UserService.register(ctx);
  }
  static async getUserInfo(ctx) {
    ctx.body = await UserService.getUserInfo(ctx);
  }
}
