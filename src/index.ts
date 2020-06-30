import "reflect-metadata";

import * as Koa from "koa";
import { configure, getLogger } from "log4js";
import { createConnection } from "typeorm";
import * as Router from "koa-router";
import AppRoutes from "./routes";

import * as jwt from "koa-jwt";
import * as fs from "fs";
import * as path from "path";
import * as KoaStatic from "koa-static2";
import * as koaBody from "koa-body";
import * as xmlParser from "koa-xml-body-v2";

import OrderService from "@src/service/order";

import ErrorHander from "@src/middleware/ErrorHander";

import config from "@src/config";

createConnection()
  .then(async connection => {
    const payApi = await OrderService.initWxPay();

    // create koa app
    const app = new Koa();
    const router = new Router({
      prefix: "/api"
    });
    const port = process.env.PORT || 9527;

    app.use(
      xmlParser({
        key: "xmlBody"
      })
    );

    // register all application routes
    AppRoutes.forEach(route => {
      if (route.path === "/order/payCallback") {
        router[route.method](
          route.path,
          payApi.middleware("pay"),
          async ctx => await OrderService.payCallback(ctx)
        );
      } else if (route.path === "/order/refundCallback") {
        router[route.method](
          route.path,
          payApi.middleware("refund"),
          async ctx => await OrderService.refundCallback(ctx)
        );
      } else {
        router[route.method](route.path, route.action);
      }
    });

    app.use(ErrorHander);
    app.use(KoaStatic("assets", path.resolve(__dirname, "../assets")));
    if (process.env.NODE_ENV !== "dev") {
      app.use(
        jwt({ secret: config.jwt.secret }).unless({
          path: [
            /^\/api\/user\/authSession|\/api\/admin\/login|\/api\/order\/payCallback|\/api\/order\/refundCallback/
          ]
        })
      );
    }
    app.use(
      koaBody({
        multipart: true,
        parsedMethods: ["POST", "PUT", "PATCH", "GET", "HEAD", "DELETE"], // parse GET, HEAD, DELETE requests
        formidable: {
          uploadDir: path.join(__dirname, "../assets/uploads/tmp")
        },
        jsonLimit: "10mb",
        formLimit: "10mb",
        textLimit: "10mb"
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

    console.log(`service listening on 🚀🚀🚀: http://localhost:${port}/api`);
  })
  .catch(error => console.log("service error 😡: ", error));
