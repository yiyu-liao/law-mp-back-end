import HttpException from "@src/utils/http-exception"
import * as koa from 'koa';
import { getLogger } from 'log4js';

const ErrorHandler = async (ctx: koa.Context, next: Function) => {
  try {
    const start = new Date()
    await next();
    if (process.env.NODE_ENV == 'dev') {
        const ms = <any>new Date() - <any>start
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    }
  } catch (error) {
    const logger = getLogger('globallog');
    logger.error(JSON.stringify({
        url: `${ctx.method} ${ctx.url}`,
        ...error
    }));

    if (error instanceof HttpException) {
      return (ctx.body = {
        ...error
      });
    }
  }
};

export default ErrorHandler;


