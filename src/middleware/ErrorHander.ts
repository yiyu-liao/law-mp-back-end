import * as koa from "koa";
import { getConnection } from "typeorm";

const ErrorHandler = async (ctx: koa.Context, next: Function) => {
  // 获取连接并创建新的queryRunner
  // const connection = getConnection();
  // const queryRunner = connection.createQueryRunner();
  // await queryRunner.connect();
  // await queryRunner.startTransaction();

  try {
    const start = new Date();
    await next();
    if (process.env.NODE_ENV == "dev") {
      const ms = <any>new Date() - <any>start;
      console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    }
  } catch (error) {
    // 对此事务执行一些操作：
    // await queryRunner.rollbackTransaction();

    if (error.status === 401) {
      error.code = "TOKEN_INVAILD";
    }
    ctx.app.emit("error", error);
    return (ctx.body = {
      ...error
    });
  }
};

export default ErrorHandler;
