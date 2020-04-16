import { Context } from "koa";
import * as fs from "fs";
import * as path from "path";
import { ResponseCode } from "@src/constant";

import * as COS from "cos-nodejs-sdk-v5";

export default class File {
  static async uploadFile(ctx: Context) {
    const file = ctx.request.files.file; // 获取上传文件
    const uploadfolderpath = path.join(__dirname, "../../assets/uploads");

    let tempfilepath = file.path;
    // 获取文件类型
    let type = file.type;

    // 获取文件名，并根据文件名获取扩展名
    let filename = file.name;
    let extname =
      filename.lastIndexOf(".") >= 0
        ? filename.slice(filename.lastIndexOf(".") - filename.length)
        : "";
    // 文件名没有扩展名时候，则从文件类型中取扩展名
    if (extname === "" && type.indexOf("/") >= 0) {
      extname = "." + type.split("/")[1];
    }
    // 将文件名重新赋值为一个随机数（避免文件重名）
    filename =
      Math.random()
        .toString()
        .slice(2) + extname;
    // 构建将要存储的文件的路径
    let filenewpath = path.join(uploadfolderpath, filename);

    // 将临时文件保存为正式的文件
    fs.renameSync(tempfilepath, filenewpath);
    // 保存成功

    return {
      code: ResponseCode.SUCCESS.code,
      data: {
        url: `${ctx.origin}/assets/uploads/${filename}`
      }
    };

    // const cos = new COS({
    //   SecretId: '',
    //   SecretKey: ''
    // });

    // cos.putObject({
    //   Bucket: 'hj-1257037304', // Bucket 格式：test-1250000000
    //   Region: 'ap-guangzhou',
    //   Key: file.name,
    //   Body: reader
    // }, function (err, data) {
    //     console.log(err, data);
    //     return data
    // });
  }
}
