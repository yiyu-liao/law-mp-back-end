import { Context } from "koa";
import { getManager, Repository, getRepository, In } from "typeorm";

import Case from "@src/entity/case";
import Bidders from "@src/entity/case-bidder";

import { CaseStatus } from "@src/constant";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/shared/http-exception";
import User from "@src/entity/user";

import * as dayjs from "dayjs";

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
   * @apiParam {Number} type case类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   * @apiParam {Number} status  case状态
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getCaseList(context?: Context) {
    const { type, status } = context.request.body;

    const caseRepo = this.getRepository<Case>(Case);

    let result = await caseRepo.find({
      where: {
        case_type: In(type !== undefined ? [type] : [1, 2, 3, 4]),
        status: In(status !== undefined ? [status] : [0, 1, 2, 3, 4, 5, 6])
      },
      join: {
        alias: "case",
        leftJoinAndSelect: {
          publisher: "case.publisher",
          selectLawyer: "case.selectLawyer",
          bidder: "case.bidders",
          lawyer: "bidder.lawyer"
        }
      },
      order: {
        create_time: "DESC"
      }
    });

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
      .orderBy({
        "case.create_time": "DESC"
      })
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/lawyerBidCaseList 获取律师参与竞价的订单list
   * @apiName lawyerBidCaseList
   * @apiGroup Case
   *
   * @apiParam {String} lawyer_id 律师id
   * @apiParam {Number} type  订单类型 1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getLawyerBidCaseList(context?: Context) {
    const { lawyer_id, type } = context.request.body;

    if (!lawyer_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.status = :status", { status: CaseStatus.bidding })
      .andWhere("case.case_type = :type", { type })
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
      .orderBy("case.create_time", "DESC")
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

    const caseRepo = this.getRepository<Case>(Case);

    let result = await getRepository(Case)
      .createQueryBuilder("case")
      .where("case.case_type = :type", { type })
      .innerJoinAndSelect(
        "case.selectLawyer",
        "selectLawyer",
        "selectLawyer.id = :lawyer_id",
        {
          lawyer_id
        }
      )
      .leftJoinAndSelect("case.publisher", "publisher")
      .leftJoinAndSelect("case.bidders", "bidder")
      .leftJoinAndSelect("bidder.lawyer", "lawyer")
      .orderBy("case.create_time", "DESC")
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

    const caseRepo = this.getRepository<Case>(Case);

    let caseInfo = await caseRepo.findOne({
      where: {
        id: case_id
      },
      join: {
        alias: "case",
        leftJoinAndSelect: {
          publisher: "case.publisher",
          payOrder: "case.payOrder",
          bidder: "case.bidders",
          lawyer: "bidder.lawyer",
          bidderMeta: "lawyer.extra_profile",
          selectLawyer: "case.selectLawyer",
          lawyerMeta: "selectLawyer.extra_profile"
        }
      }
    });

    return {
      code: ResponseCode.SUCCESS.code,
      data: caseInfo,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/updateCaseInfo 更新case信息
   * @apiName updateCaseInfo
   * @apiGroup Case
   *
   * @apiParam {Number} case_id  案件id.
   * @apiParam {Number} status  状态值. 抢单中 => 0, 待处理 => 1, 处理中 = 2, 完成 => 3, 申诉 => 4, 取消 => 5
   * @apiParam {Number} extra_info  case信息，json结构，更新时候需要把全部字段传进来
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateCaseInfo(ctx?: Context) {
    const Repo = this.getRepository<Case>(Case);

    const { case_id, status, extra_info } = ctx.request.body;

    if (!status && !extra_info) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }
    if (status !== undefined) {
      const auto_confirm_time = dayjs()
        .add(5, "day")
        .format("YYYY-MM-DD HH:mm:ss");
      await Repo.update(case_id, {
        status,
        auto_confirm_time:
          status === CaseStatus.pendingConfirm ? auto_confirm_time : null
      });
    }
    if (extra_info !== undefined) {
      await Repo.update(case_id, {
        extra_info: JSON.parse(extra_info)
      });
    }

    return {
      code: ResponseCode.SUCCESS.code,
      data: {},
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/updateBidPrice 更新律师竞价金额
   * @apiName updateBidPrice
   * @apiGroup Case
   *
   * @apiParam {Number} bid_id  竞价id.
   * @apiParam {Number} price  价钱
   *
   * @apiSuccess {String} code S_Ok
   */
  static async updateBidPrice(ctx?: Context) {
    const { bid_id, price } = ctx.request.body;

    if (!bid_id || !price) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    const BidderRepo = this.getRepository<Bidders>(Bidders);

    await BidderRepo.update(bid_id, {
      price
    });

    return {
      code: ResponseCode.SUCCESS.code,
      data: {},
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /case/cancelBid 取消竞价
   * @apiName cancelBid
   * @apiGroup Case
   *
   * @apiParam {Number} bid_id  竞价id.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async cancelBid(ctx?: Context) {
    const { bid_id } = ctx.request.body;

    if (!bid_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    const BidderRepo = this.getRepository<Bidders>(Bidders);

    await BidderRepo.delete(bid_id);

    return {
      code: ResponseCode.SUCCESS.code,
      data: {},
      message: ResponseCode.SUCCESS.msg
    };
  }
}
