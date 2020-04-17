import { Context } from "koa";
import * as fs from "fs";
import { ResponseCode } from "@src/constant";
import * as Config from "../../config.js";

import * as COS from "cos-nodejs-sdk-v5";

import { createHttpResponse } from "@src/shared";

export default class File {
  /**
   * @api {post} /files/upload 文件上传
   * @apiName publish
   * @apiGroup FileUpload
   *
   * @apiParam {Array} files 上传的文件, 数组格式
   *
   * @apiSuccess {String} code S_Ok
   */
  static async uploadFile(ctx: Context) {
    const files = ctx.request.files.files;

    const cos = new COS({
      SecretId: Config["cos"].SecretId,
      SecretKey: Config["cos"].SecretKey
    });

    const upload = (file): Promise<String> => {
      return new Promise((resolve, reject) => {
        cos.putObject(
          {
            Bucket: "hj-1257037304",
            Region: "ap-guangzhou",
            Key: file.name,
            Body: fs.createReadStream(file.path),
            ContentLength: file.size
          },
          function(err, data) {
            fs.unlink(file.path, function() {
              if (err) {
                reject(err);
              } else {
                resolve(`https://${data.Location}`);
              }
            });
          }
        );
      });
    };

    const invokeUpload = (files): Promise<string[]> => {
      return Promise.all(
        files.map(file => {
          return upload(file);
        })
      );
    };

    const urls = await invokeUpload(files);

    let { code, msg } = ResponseCode.SUCCESS;
    return createHttpResponse(code, msg, { urls });
  }
}
