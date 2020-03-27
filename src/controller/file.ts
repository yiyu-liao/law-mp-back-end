import FileService from "@src/service/file";

export default class FileController {
  static async uploadFile(ctx) {
    ctx.body = await FileService.uploadFile(ctx);
  }
}
