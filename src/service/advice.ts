import { Context } from "koa";

import { getManager, Repository, getRepository } from "typeorm";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/shared/http-exception";

import Advice from "@src/entity/advice";
import AdviceReply from "@src/entity/advice-reply";
import WxService from "./wx";
import User from "@src/entity/user";

export default class AdviceService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
     * @api {post} /advice/publish 发布咨询
     * @apiName publishAdvice
     * @apiGroup Advice
     *
     * @apiParam {Number} advicer_id  发布者id
     * @apiParam {Number} topic  咨询主题。1 => 民事代理, 2 => 商事纠纷, 3 => 刑事辩护, 4 => 行政诉讼
     * @apiParam {String} title  咨询标题
     * @apiParam {content} content  咨询内容

     *
     * @apiSuccess {String} code S_Ok
   */
  static async publishAdvice(context?: Context) {
    const adviceRepo = this.getRepository<Advice>(Advice);
    const userRepo = this.getRepository<User>(User);

    const { advicer_id, topic, content, title } = context.request.body;
    if (!advicer_id || !topic || !content || !title) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    const user = await userRepo.findOne(advicer_id);

    if (!user) {
      throw new HttpException({
        code: ResponseCode.USER_NOT_EXIT.code,
        message: ResponseCode.USER_NOT_EXIT.msg
      });
    }

    const advice = adviceRepo.create({
      topic,
      title,
      content,
      advicer: user
    });

    const result = await adviceRepo.save(advice);
    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /advice/reply 回复咨询
   * @apiName replyAdvice
   * @apiGroup Advice
   *
   * @apiParam {Number} advice_id  咨询id
   * @apiParam {Number} title  咨询title
   * @apiParam {Number} pid 回复目标评论的id, 若是目标是咨询内容，pid为0
   * @apiParam {String} content  回复内容
   * @apiParam {String} from_id  回复者id
   * @apiParam {String} to_id  被回复者id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async replyAdvice(context?: Context) {
    const ReplyRepo = this.getRepository<AdviceReply>(AdviceReply);
    // const AdviceRepo = this.getRepository<Advice>(Advice);
    const UserRepo = this.getRepository<User>(User);

    const {
      advice_id,
      title,
      pid,
      content,
      to_id,
      from_id
    } = context.request.body;

    const advice = new Advice();
    advice.id = advice_id;

    let from = await UserRepo.findOne(from_id);
    let to = await UserRepo.findOne(to_id);

    const reply = ReplyRepo.create({
      pid,
      content,
      from,
      to,
      advice
    });

    let res = await ReplyRepo.save(reply);

    const wsRes = await WxService.sendMessageToUser({
      touser: to.openid,
      replyer: from.real_name,
      content,
      title: title
    });

    return {
      code: ResponseCode.SUCCESS.code,
      data: res,
      message: ResponseCode.SUCCESS.msg,
      subscribeRes: wsRes.data
    };
  }

  /**
    * @api {post} /advice/detail 获取咨询详情
    * @apiName getAdviceDetail
    * @apiGroup Advice
    *
    * @apiParam {Number} advice_id  咨询id

    * @apiSuccess {String} code 
  */
  static async getAdviceDetail(context?: Context) {
    const Repo = this.getRepository(Advice);

    const { advice_id } = context.request.body;

    if (!advice_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let advice = await getRepository(Advice)
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
   * @apiGroup Advice
   *
   *
   * @apiSuccess {String} code S_Ok
   * @apiSuccess {Array} data []
   */
  static async getAllAdvices(context?: Context) {
    const Repo = this.getRepository(Advice);

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
   * @apiGroup Advice
   *
   * @apiParam {String} customer_id  客户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerAllAdvices(context?: Context) {
    const { customer_id } = context.request.body;

    if (!customer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Advice)
      .createQueryBuilder("Advice")
      .innerJoinAndSelect(
        "Advice.advicer",
        "advicer",
        "advicer.id = :customer_id",
        {
          customer_id
        }
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
   * @apiGroup Advice
   *
   * @apiParam {String} lawyer_id  律师id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getAdivicesRelateReplyUser(context?: Context) {
    const { lawyer_id } = context.request.body;

    if (!lawyer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Advice)
      .createQueryBuilder("Advice")
      .innerJoinAndSelect(
        "Advice.replies",
        "reply",
        "reply.from_id = :lawyer_id",
        { lawyer_id }
      )
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
