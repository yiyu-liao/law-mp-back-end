import "reflect-metadata";
import * as Koa from "koa";
import { configure, getLogger } from "log4js";
import { createConnection } from "typeorm";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";

import AppRoutes from "./routes";

import * as jwt from "koa-jwt";
import * as fs from "fs";
import * as path from "path";
import * as KoaBody from "koa-body";
import * as KoaStatic from "koa-static2";
import { WxPayApi } from "@src/service/order";

import ErrorHander from "@src/middleware/ErrorHander";
import koaBody = require("koa-body");

const publicKey = fs.readFileSync(path.join(__dirname, "../publicKey.pub"));

createConnection()
  .then(async connection => {
    // create koa app
    const app = new Koa();
    const router = new Router({
      prefix: "/api"
    });
    const port = process.env.PORT || 9527;

    // register all application routes
    AppRoutes.forEach(route => {
      if (route.path === "/pay/refundNoticeCallback") {
        router[route.method](
          route.path,
          WxPayApi.middleware("pay"),
          route.action
        );
      } else if (route.path === "/pay/refundNoticeCallback") {
        router[route.method](
          route.path,
          WxPayApi.middleware("refund"),
          route.action
        );
      } else {
        router[route.method](route.path, route.action);
      }
    });

    app.use(ErrorHander);
    app.use(KoaStatic("assets", path.resolve(__dirname, "../assets")));
    // app.use(
    //   jwt({ secret: publicKey }).unless({
    //     path: [/^\/api\/user\/authSession|\/api\/admin\/login/]
    //   })
    // );
    app.use(
      bodyParser({
        enableTypes: ["json", "form", "text"],
        extendTypes: {
          text: ["text/xml", "application/xml"]
        }
      })
    );
    app.use(
      koaBody({
        multipart: true,
        formidable: {
          uploadDir: path.join(__dirname, "../assets/uploads/tmp")
        }
      })
    );

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(port);

    // error log
    configure({
      appenders: {
        globallog: {
          type: "file",
          filename: "./logs/globallog.log"
        }
      },
      categories: {
        default: {
          appenders: ["globallog"],
          level: "debug"
        }
      }
    });
    const logger = getLogger("globallog");
    process.on("uncaughtException", err => {
      logger.error(JSON.stringify(err));
    });

    app.on("error", error => {
      logger.error(JSON.stringify(error));
    });

    console.log(`应用启动成功 端口:${port}`);
  })
  .catch(error => console.log("TypeORM 链接失败: ", error));
