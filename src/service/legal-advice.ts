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

    const { c_id } = context.request.body;

    if (!c_id) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      let result = await Repo.find({
        where: {
          c_id
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

    const { c_id, topic, content } = context.request.body;
    c_id
    if (!c_id || !topic || !content) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    let advice = new LegalAdvice();
    advice.c_id = c_id;
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
      from_id,
      from_name,
      to_id,
      to_name
    } = context.request.body;

    let reply = new AdviceReply();
    let advice = new LegalAdvice();

    advice.id = advice_id;

    reply.pid = pid;
    reply.content = content;
    reply.from_id = from_id;
    reply.from_name = from_name;
    reply.to_id = to_id;
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
