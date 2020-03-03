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


  /**
     * @api {post} /advice/publish 客户发布咨询
     * @apiName publishAdvice
     * @apiGroup Legal Advice
     *
     * @apiParam {Number} c_openid  发布者c_openid
     * @apiParam {Number} topic  咨询主题
     * @apiParam {content} content  咨询内容

     *
     * @apiSuccess {String} code 200
   */
  static async publishAdvice(context?: Context) {
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


  /**
     * @api {post} /advice/reply 回复咨询
     * @apiName replyAdvice
     * @apiGroup Legal Advice
     *
     * @apiParam {Number} advice_id  咨询id
     * @apiParam {Number} pid  回复目标评论的id, 若是目标是咨询内容，pid为0
     * @apiParam {content} content  回复内容
     * @apiParam {content} from_openid  回复者openid
     * @apiParam {content} from_name  回复者名字
     * @apiParam {content} to_openid  被回复者openid
     * @apiParam {content} to_name  被回复者名字

     *
     * @apiSuccess {String} code 200
   */
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
      const res = await ReplyRep.save(reply);

      return {
        code: 200,
        data: res,
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


   /**
     * @api {post} /advice/detail 获取详情咨询详情
     * @apiName getAdviceDetail
     * @apiGroup Legal Advice
     *
    * @apiParam {Number} id  咨询id

     * @apiSuccess {String} code 200
     * @apiSuccess {Array} data []
   */
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
      const error = {
        code: e.code,
        msg: e.message
      };
      throw new HttpException(error);
    }
  }

  /**
     * @api {post} /advice/customer 获取客户咨询列表
     * @apiName getCustomerAllAdvices
     * @apiGroup Legal Advice
     *
     * @apiParam {Number} openid  客户唯一openid.
     *
     * @apiSuccess {String} code 200
   */
  static async getCustomerAllAdvices(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { openid } = context.request.body;

    if (!openid) {
      const error = {
        code: RequesetErrorCode.PARAMS_ERROR.code,
        msg: RequesetErrorCode.PARAMS_ERROR.msg
      };
      throw new HttpException(error);
    }

    try {
      let result = await Repo.find({
        where: {
          c_openid: openid
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

   /**
     * @api {get} /advice/all 获取系统所有咨询列表
     * @apiName getAllAdvices
     * @apiGroup Legal Advice
     *
     *
     * @apiSuccess {String} code 200
     * @apiSuccess {Array} data []
   */
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

  static async deleteAdvice() {}

  static async updateAdice() {}
}
