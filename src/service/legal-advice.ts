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
     * @apiParam {String} title  咨询标题
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
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    // TO DO: 以user_id关联发布者信息
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
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /advice/reply 回复咨询
   * @apiName replyAdvice
   * @apiGroup Legal Advice
   *
   * @apiParam {Number} advice_id  咨询id
   * @apiParam {Number} title  咨询title
   * @apiParam {Number} pid 回复目标评论的id, 若是目标是咨询内容，pid为0
   * @apiParam {String} content  回复内容
   * @apiParam {String} from_openid  回复者openid
   * @apiParam {String} to_openid  被回复者openid
   *
   * @apiSuccess {String} code S_Ok
   */
  static async replyAdvice(context?: Context) {
    const ReplyRepo = this.getRepository<AdviceReply>(AdviceReply);
    // const AdviceRepo = this.getRepository<LegalAdvice>(LegalAdvice);
    const UserRepo = this.getRepository<User>(User);

    const {
      advice_id,
      title,
      pid,
      content,
      to_openid,
      from_openid
    } = context.request.body;

    const advice = new LegalAdvice();
    advice.id = advice_id;

    // TO DO: 以user_id关联用户信息
    let from = await UserRepo.findOne({ where: { openid: from_openid } });
    let to = await UserRepo.findOne({ where: { openid: to_openid } });

    const reply = ReplyRepo.create({
      pid,
      content,
      from,
      to,
      advice
    });

    let res = await ReplyRepo.save(reply);

    const { data } = await WxService.sendMessageToUser({
      touser: to_openid,
      replyer: from.real_name,
      content,
      title: title
    });

    return {
      code: ResponseCode.SUCCESS.code,
      data: res,
      message: ResponseCode.SUCCESS.msg,
      subscribeRes: data
    };
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
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let advice = await getRepository(LegalAdvice)
      .createQueryBuilder("Advice")
      .where("Advice.id = :advice_id", { advice_id })
      .innerJoinAndSelect("Advice.advicer", "advicer")
      .leftJoinAndSelect("Advice.replies", "replies")
      .leftJoinAndSelect("replies.from", "from")
      .leftJoinAndSelect("replies.to", "to")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: advice ? advice : null,
      message: ResponseCode.SUCCESS.msg
    };
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

    let result = await Repo.find({ relations: ["advicer", "replies"] });

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /advice/customer 获取客户咨询列表
   * @apiName getCustomerAllAdvices
   * @apiGroup Legal Advice
   *
   * @apiParam {Number} user_id  客户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerAllAdvices(context?: Context) {
    const { user_id } = context.request.body;

    if (!user_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(LegalAdvice)
      .createQueryBuilder("Advice")
      .innerJoinAndSelect(
        "Advice.advicer",
        "advicer",
        "advicer.id = :user_id",
        { user_id }
      )
      .leftJoinAndSelect("Advice.replies", "replies")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /advice/relateReplyUser 获取用户的咨询列表
   * @apiName getCustomerAllAdvices
   * @apiGroup Legal Advice
   *
   * @apiParam {Number} user_id  律师id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getAdivicesRelateReplyUser(context?: Context) {
    const { user_id } = context.request.body;

    if (!user_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(LegalAdvice)
      .createQueryBuilder("Advice")
      .innerJoinAndSelect("Advice.replies", "replies")
      .leftJoinAndSelect("replies.from", "from", "from.id = :id", {
        id: user_id
      })
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  static async deleteAdvice() {}

  static async updateAdice() {}
}
