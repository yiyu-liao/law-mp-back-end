import * as koa from "koa";

const ErrorHandler = async (ctx: koa.Context, next: Function) => {
  try {
    const start = new Date();
    await next();
    if (process.env.NODE_ENV == "dev") {
      const ms = <any>new Date() - <any>start;
      console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    }
  } catch (error) {
    ctx.app.emit("error", error);
    return (ctx.body = {
      ...error
    });
  }
};

export default ErrorHandler;
