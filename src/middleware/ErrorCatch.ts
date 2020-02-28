import HttpException from "@src/utils/http-exception";

const errorCatch = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HttpException) {
      return (ctx.body = {
        ...error
      });
    }
  }
};

export default errorCatch;
