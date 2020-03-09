import { Context } from "koa";

import { getManager, Repository } from "typeorm";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

import LegalAdvice from "@src/entity/legal-advice";
import AdviceReply from "@src/entity/advice-reply";
import WxService from "./wx";

export default class LegalAdviceService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
     * @api {post} /advice/publish 发布咨询
     * @apiName publishAdvice
     * @apiGroup Legal Advice
     *
     * @apiParam {Number} c_openid  发布者c_openid
     * @apiParam {Number} topic  咨询主题。1 => 民事代理, 2 => 商事纠纷, 3 => 刑事辩护, 4 => 行政诉讼
     * @apiParam {content} content  咨询内容

     *
     * @apiSuccess {String} code S_Ok
   */
  static async publishAdvice(context?: Context) {
    const Repo = this.getRepository<LegalAdvice>(LegalAdvice);

    const { c_openid, topic, content } = context.request.body;
    if (!c_openid || !topic || !content) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      const advice = Repo.create({
        c_openid,
        topic,
        content
      });

      const result = await Repo.save(advice);
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

      WxService.sendMessageToUser({
        touser: to_openid,
        replyer: from_name,
        content,
        title: ""
      });

      return {
        code: ResponseCode.SUCCESS.code,
        data: res,
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
    * @api {post} /advice/detail 获取咨询详情
    * @apiName getAdviceDetail
    * @apiGroup Legal Advice
    *
    * @apiParam {Number} id  咨询id

    * @apiSuccess {String} code 
  */
  static async getAdviceDetail(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { id } = context.request.body;

    if (!id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    try {
      const advice = await Repo.findOne(id, { relations: ["replies"] });
      return {
        code: ResponseCode.SUCCESS.code,
        data: advice,
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
   * @api {post} /advice/customer 获取特定客户咨询列表
   * @apiName getCustomerAllAdvices
   * @apiGroup Legal Advice
   *
   * @apiParam {Number} openid  客户唯一openid.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerAllAdvices(context?: Context) {
    const Repo = this.getRepository(LegalAdvice);

    const { openid } = context.request.body;

    if (!openid) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        msg: ResponseCode.ERROR_PARAMS.msg
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
      let result = await Repo.find({ relations: ["replies"] });

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
