import { Context } from "koa";

import { getManager, Repository, getRepository } from "typeorm";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import LegalAdvice from "@src/entity/legal-advice";
import AdviceReply from "@src/entity/advice-reply";
import WxService from "./wx";
import User from "@src/entity/user";

export default class LegalAdviceService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
     * @api {post} /advice/publish 发布咨询
     * @apiName publishAdvice
     * @apiGroup Legal Advice
     *
     * @apiParam {Number} advicer_openid  发布者的openid
     * @apiParam {Number} topic  咨询主题。1 => 民事代理, 2 => 商事纠纷, 3 => 刑事辩护, 4 => 行政诉讼
     * @apiParam {content} content  咨询内容

     *
     * @apiSuccess {String} code S_Ok
   */
  static async publishAdvice(context?: Context) {
    const Repo = this.getRepository<LegalAdvice>(LegalAdvice);

    const { advicer_openid, topic, content, title } = context.request.body;
    if (!advicer_openid || !topic || !content || !title) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      const user = await this.getRepository<User>(User).findOne({
        where: { openid: advicer_openid }
      });

      const advice = Repo.create({
        topic,
        title,
        content,
        advicer: user
      });

      const result = await Repo.save(advice);
      return {
        code: ResponseCode.SUCCESS.code,
        data: result,
        msg: ResponseCode.SUCCESS.msg
      };
    } catch (e) {
      // console.log('error', e)

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
     * @apiParam {Number} pid 回复目标评论的id, 若是目标是咨询内容，pid为0
     * @apiParam {String} content  回复内容
     * @apiParam {String} from_openid  回复者openid
     * @apiParam {String} from_name  回复者名字
     * @apiParam {String} to_openid  被回复者openid
     * @apiParam {String} to_name  被回复者名字

     *
     * @apiSuccess {String} code S_Ok
   */
  static async replyAdvice(context?: Context) {
    const ReplyRepo = this.getRepository<AdviceReply>(AdviceReply);

    const {
      advice_id,
      pid,
      content,
      from_openid,
      from_name,
      to_openid,
      to_name
    } = context.request.body;

    try {
      const advice = new LegalAdvice();
      advice.id = advice_id;

      const reply = ReplyRepo.create({
        pid,
        content,
        from_openid,
        from_name,
        to_openid,
        to_name,
        advice
      });

      const res = await ReplyRepo.save(reply);

      const { data } = await WxService.sendMessageToUser({
        touser: to_openid,
        replyer: from_name,
        content,
        title: ""
      });

      return {
        code: ResponseCode.SUCCESS.code,
        data: res,
        msg: ResponseCode.SUCCESS.msg,
        subscribeRes: data
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
    * @api {post} /advice/detail 获取咨询详情
    * @apiName getAdviceDetail
    * @apiGroup Legal Advice
    *
    * @apiParam {Number} advice_id  咨询id

    * @apiSuccess {String} code 
  */
  static async getAdviceDetail(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { advice_id } = context.request.body;

    if (!advice_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      const advice = await Repo.findOne(advice_id, {
        relations: ["advicer", "replies"]
      });
      return {
        code: ResponseCode.SUCCESS.code,
        data: advice ? advice : null,
        msg: ResponseCode.SUCCESS.msg
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
   * @api {get} /advice/all 获取所有客户咨询列表
   * @apiName getAllAdvices
   * @apiGroup Legal Advice
   *
   *
   * @apiSuccess {String} code S_Ok
   * @apiSuccess {Array} data []
   */
  static async getAllAdvices(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    try {
      let result = await Repo.find({ relations: ["advicer", "replies"] });

      return {
        code: ResponseCode.SUCCESS.code,
        data: result,
        msg: ResponseCode.SUCCESS.msg
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
   * @apiParam {Number} customer_openid  客户openid.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerAllAdvices(context?: Context) {
    const { customer_openid } = context.request.body;

    if (!customer_openid) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      let result = await getRepository(LegalAdvice)
        .createQueryBuilder("Advice")
        .innerJoinAndSelect(
          "Advice.advicer",
          "advicer",
          "advicer.openid = :customer_openid",
          { customer_openid }
        )
        .leftJoinAndSelect("Advice.replies", "replies")
        .getMany();

      return {
        code: ResponseCode.SUCCESS.code,
        data: result,
        msg: ResponseCode.SUCCESS.msg
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
   * @api {post} /advice/lawyer 获取律师回复的咨询列表
   * @apiName getLawyerReplyAdvice
   * @apiGroup Legal Advice
   *
   * @apiParam {Number} lawyer_openid  律师openid.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getLawyerReplyAdvice(context?: Context) {
    const { lawyer_openid } = context.request.body;

    if (!lawyer_openid) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      let result = await getRepository(LegalAdvice)
        .createQueryBuilder("advice")
        .innerJoinAndSelect(
          "advice.replies",
          "reply",
          "reply.from_openid = :lawyer_openid",
          { lawyer_openid }
        )
        .leftJoinAndSelect("advice.advicer", "advicer")
        .getMany();

      return {
        code: ResponseCode.SUCCESS.code,
        data: result,
        msg: ResponseCode.SUCCESS.msg
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
