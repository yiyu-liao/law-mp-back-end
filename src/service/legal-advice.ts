import { Context } from "koa";

import { getManager, Repository } from "typeorm";

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import LegalAdvice from "@src/entity/legal-advice";
import AdviceReply from "@src/entity/advice-reply";

export default class LegalAdviceService {
  static getRepository(entity: any) {
    return getManager().getRepository(entity);
  }

  static async getCustomerAllAdvices(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { c_openid } = context.request.body;

    if (!c_openid) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      let result = await Repo.find({
        where: {
          c_openid
        }
      });

      return {
        code: 200,
        data: result,
        msg: null
      };
    } catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  static async getAllAdvices(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    try {
      let result = await Repo.find();

      return {
        code: 200,
        data: result,
        msg: null
      };
    } catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  static async getAdviceDetail(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { id } = context.request.body;

    if (!id) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      const advice = await Repo.findOne(id, { relations: ["replies"] });
      return {
        code: 200,
        data: advice,
        msg: null
      };
    } catch (e) {
      console.log(e)
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  static async addAdvice(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { c_openid, topic, content } = context.request.body;
    if (!c_openid || !topic || !content) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    let advice = new LegalAdvice();
    advice.c_openid = c_openid;
    advice.topic = topic;
    advice.content = content;

    try {
      const result = await Repo.save(advice);
      return {
        code: 200,
        data: result,
        msg: null
      };
    } catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  static async replyAdvice(context?: Context) {
    const ReplyRep = this.getRepository(AdviceReply);

    const {
      advice_id,
      pid,
      content,
      from_openid,
      from_name,
      to_openid,
      to_name
    } = context.request.body;

    let reply = new AdviceReply();
    let advice = new LegalAdvice();

    advice.id = advice_id;

    reply.pid = pid;
    reply.content = content;
    reply.from_openid = from_openid;
    reply.from_name = from_name;
    reply.to_openid = to_openid;
    reply.to_name = to_name;

    reply.advice = advice;

    try {
      // TO DO: review
      await ReplyRep.save(reply);

      // await AdviceRep.update(advice_id, { replies: reply });

      return {
        code: 200,
        data: null,
        msg: null
      };
    } catch (e) {
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  static async deleteAdvice() {}

  static async updateAdice() {}
}
