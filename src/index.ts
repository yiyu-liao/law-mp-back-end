import "reflect-metadata";
import * as Koa from "koa";
import { configure, getLogger } from 'log4js';
import { createConnection } from "typeorm";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";
import AppRoutes from "./routes";

import ErrorHander from "@src/middleware/ErrorHander";

createConnection()
  .then(async connection => {
    // create koa app
    const app = new Koa();
    const router = new Router({
      prefix: "/api"
    });
    const port = process.env.PORT || 3000;
    const env = process.env.NODE_ENV || 'dev' // Current mode

    // error log
    configure({
      appenders: {
        globallog: {
          type: 'file',
          filename: './logs/globallog.log'
        }
      },
      categories: {
        default: {
          appenders: ['globallog'],
          level: 'debug'
        }
      }
    });
    const logger = getLogger('globallog');

    // register all application routes
    AppRoutes.forEach(route => router[route.method](route.path, route.action));

    app.use(ErrorHander);
    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(port);

    process.on('uncaughtException', err => {
      logger.error(JSON.stringify(err));
    });

    app.on('error', (error) => {
      logger.error(JSON.stringify(error));
    })

    console.log(`应用启动成功 端口:${port}`);
  })
  .catch(error => console.log("TypeORM 链接失败: ", error));
