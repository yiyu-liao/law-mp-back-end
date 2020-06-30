import { Context } from "koa";
import * as fs from "fs";
import { ResponseCode } from "@src/constant";

import * as COS from "cos-nodejs-sdk-v5";
import config from "@src/config";

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

    let fileArray = null;

    if (!Array.isArray(files)) {
      fileArray = [files];
    } else {
      fileArray = files;
    }

    const cos = new COS({
      SecretId: config.cos.SecretId,
      SecretKey: config.cos.SecretKey
    });

    const upload = (file): Promise<String> => {
      return new Promise((resolve, reject) => {
        cos.putObject(
          {
            Bucket: "hr-1257037304",
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

    const urls = await invokeUpload(fileArray);

    let { code, msg } = ResponseCode.SUCCESS;
    return createHttpResponse(code, msg, { urls });
  }
}
