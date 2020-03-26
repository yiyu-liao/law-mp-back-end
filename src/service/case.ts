import { Context } from "koa";
import { getManager, Repository, getRepository } from "typeorm";

import Case from "@src/entity/case";
import Bidders from "@src/entity/case-bidder";

import { CaseStatus } from "@src/constant";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/shared/http-exception";
import User from "@src/entity/user";

export default class OrderService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
   * @api {post} /case/publish 发布文书起草/案件委托等需求
   * @apiName publish
   * @apiGroup Case
   *
   * @apiParam {Number} customer_id  客户id.
   * @apiParam {Number} case_type  订单类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   * @apiParam {Object} extra_info 自定义的表单提交数据 { description?: string, response_time?: number, limit_time?: number; ... }
   *
   * @apiSuccess {String} code S_Ok
   */
  static async publicCase(context?: Context) {
    const Repo = this.getRepository<Case>(Case);
    const UserRepo = this.getRepository<User>(User);

    const { customer_id, case_type, extra_info } = context.request.body;

    if (!customer_id || !case_type) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let publisher = await UserRepo.findOne(customer_id);

    const newCase = Repo.create({
      publisher,
      case_type,
      extra_info: JSON.parse(extra_info)
    });

    const result = await Repo.save(newCase);

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/bid 律师进行对需求进行抢单
   * @apiName bid
   * @apiGroup Case
   *
   * @apiParam {Number} case_id  案件id.
   * @apiParam {Number} lawyer_id  律师id.
   * @apiParam {Number} price 报价
   *
   * @apiSuccess {String} code S_Ok
   */
  static async bidCase(context?: Context) {
    const BidderRepo = this.getRepository<Bidders>(Bidders);
    const UserRepo = this.getRepository<User>(User);

    const { case_id, lawyer_id, price } = context.request.body;

    if (!case_id || !lawyer_id || !price) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let targetCase = new Case();
    targetCase.id = case_id;

    let lawyer = await UserRepo.findOne(lawyer_id);

    let bidder = BidderRepo.create({
      lawyer,
      price,
      case: targetCase
    });

    await BidderRepo.save(bidder);
    return {
      code: ResponseCode.SUCCESS.code,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/list 获取需求订单list
   * @apiName getCaseList
   * @apiGroup Case
   *
   * @apiParam {Number} type  1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCaseList(context?: Context) {
    const { type } = context.request.body;

    if (!type) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.case_type = :type", { type })
      .andWhere("case.status = :status", { status: CaseStatus.bidding })
      .leftJoinAndSelect("case.bidders", "bidder")
      .leftJoinAndSelect("bidder.lawyer", "lawyer")
      .leftJoinAndSelect("case.publisher", "publisher")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/customerList 获取客户发布的需求订单list
   * @apiName customer case list
   * @apiGroup Case
   *
   * @apiParam {Number} type  1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   * @apiParam {Number} customer_id  用户id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCustomerList(context?: Context) {
    const { customer_id, type } = context.request.body;

    if (!type || !customer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.case_type = :type", { type })
      .innerJoinAndSelect(
        "case.publisher",
        "publisher",
        "publisher.id = :customer_id",
        { customer_id }
      )
      .leftJoinAndSelect("case.bidders", "bidder")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/lawyerList 获取律师参与的订单list
   * @apiName lawyer case list
   * @apiGroup Case
   *
   * @apiParam {Number} type  1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   * @apiParam {String} lawyer_id 律师id
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getLawyerList(context?: Context) {
    const { lawyer_id, type } = context.request.body;

    if (!type || !lawyer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.case_type = :type", { type })
      .innerJoinAndSelect(
        "case.bidders",
        "bidder",
        "bidder.lawyer_id = :lawyer_id",
        {
          lawyer_id
        }
      )
      .leftJoinAndSelect("bidder.lawyer", "lawyer")
      .leftJoinAndSelect("case.publisher", "publisher")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/detail 获取订单详情
   * @apiName get case detail
   * @apiGroup Case
   *
   * @apiParam {Number} case_id  案件id.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCaseDetail(context?: Context) {
    const { case_id } = context.request.body;

    if (!case_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.id = :case_id", { case_id })
      .leftJoinAndSelect("case.publisher", "publisher")
      .leftJoinAndSelect("case.bidders", "bidder")
      .leftJoinAndSelect("bidder.lawyer", "lawyer")
      .leftJoinAndSelect("lawyer.extra_profile", "bidderMeta")
      .getOne();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/selectBidder 客户选中报价律师
   * @apiName selectBidder
   * @apiGroup Case
   *
   * @apiParam {Number} case_id  案件id.
   * @apiParam {Number} select_lawyer_id  选中服务律师的id.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async selectBidder(context?: Context) {
    const Repo = this.getRepository<Case>(Case);

    const { case_id, select_lawyer_id } = context.request.body;

    if (!case_id || !select_lawyer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let targetCase = Repo.create({
      select_lawyer_id,
      status: CaseStatus.pending
    });
    const res = await Repo.update(case_id, targetCase);
    return {
      code: ResponseCode.SUCCESS.code,
      data: res,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/updateStatus 更新order状态
   * @apiName updateStatus
   * @apiGroup Case
   *
   * @apiParam {Number} case_id  案件id.
   * @apiParam {Number} status  状态值. 抢单中 => 0, 待处理 => 1, 处理中 = 2, 完成 => 3, 申诉 => 4, 取消 => 5
   *
   * @apiSuccess {String} code S_Ok
   */
  static async changeCaseStatus(ctx?: Context) {
    const Repo = this.getRepository<Case>(Case);

    const { case_id, status } = ctx.request.body;

    // To Review, 判定状态流改变规则
    // const orderInfo  = await orderRepo.findOne(case_id);

    if (!status) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }
    await Repo.update(case_id, {
      status
    });
    return {
      code: ResponseCode.SUCCESS.code,
      data: null,
      message: ResponseCode.SUCCESS.msg
    };
  }
}
