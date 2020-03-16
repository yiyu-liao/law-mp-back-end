import { Context } from "koa";
import { getManager, Repository, getRepository } from "typeorm";

import Order, { ORDER_STATUS } from "@src/entity/order";
import Bidders from "@src/entity/bidders";
import WxService from "./wx";

import { ResponseCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";
import User from "@src/entity/user";

export default class OrderService {
  static getRepository<T>(target: any): Repository<T> {
    return getManager().getRepository(target);
  }

  /**
   * @api {post} /order/publish 发布文书起草/案件委托等需求
   * @apiName publish
   * @apiGroup Order
   *
   * @apiParam {Number} customer_id  客户id.
   * @apiParam {Number} order_type  订单类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   * @apiParam {Object} extra_info 自定义的表单提交数据 { description?: string, response_time?: number, limit_time?: number; ... }
   *
   * @apiSuccess {String} code S_Ok
   */
  static async publishOrder(context?: Context) {
    const Repo = this.getRepository<Order>(Order);
    const userRepo = this.getRepository<User>(User);

    const { customer_id, order_type, extra_info } = context.request.body;

    if (!customer_id || !order_type) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    // let publisher = await userRepo.findOne(customer_id);

    let publisher = new User();
    publisher.id = customer_id;

    const order = Repo.create({
      publisher,
      order_type,
      extra_info: JSON.parse(extra_info)
    });

    const result = await Repo.save(order);

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/bid 律师进行对需求进行抢单
   * @apiName bid
   * @apiGroup Order
   *
   * @apiParam {Number} order_id  订单id.
   * @apiParam {Number} lawyer_id  律师id.
   * @apiParam {Number} price 报价
   *
   * @apiSuccess {String} code S_Ok
   */
  static async bidOrder(context?: Context) {
    const bidderRepo = this.getRepository<Bidders>(Bidders);

    const { order_id, lawyer_id, price } = context.request.body;

    if (!order_id || !lawyer_id || !price) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let order = new Order();
    order.id = order_id;

    let lawyer = new User();
    lawyer.id = lawyer_id;

    let bidder = bidderRepo.create({
      lawyer,
      price,
      order
    });

    await bidderRepo.save(bidder);
    return {
      code: ResponseCode.SUCCESS.code,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/list 获取需求订单list
   * @apiName getOrderList
   * @apiGroup Order
   *
   * @apiParam {Number} type  1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getOrderList(context?: Context) {
    const { type } = context.request.body;

    if (!type) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Order)
      .createQueryBuilder("Order")
      .where("Order.order_type = :type", { type })
      .where("Order.status = :status", { status: ORDER_STATUS.pending })
      .leftJoinAndSelect("Order.bidders", "bidders")
      .leftJoinAndSelect("Order.publisher", "publisher")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/detail 获取订单详情
   * @apiName getOrderDetail
   * @apiGroup Order
   *
   * @apiParam {Number} order_id  订单id.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async getOrderDetail(context?: Context) {
    const orderRepo = this.getRepository<Order>(Order);
    const { order_id } = context.request.body;

    if (!order_id) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let result = await getRepository(Order)
      .createQueryBuilder("Order")
      .where("Order.id = :order_id", { order_id })
      .leftJoinAndSelect("Order.bidders", "bidders")
      .leftJoinAndSelect("bidders.lawyer", "lawyer")
      .leftJoinAndSelect("lawyer.extra_profile", "bidder_extra_profile")
      .leftJoinAndSelect("Order.publisher", "publisher")
      .leftJoinAndSelect("publisher.extra_profile", "publisher_extra_profile")
      .getMany();

    return {
      code: ResponseCode.SUCCESS.code,
      data: result,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/selectBidder 客户选中报价律师
   * @apiName selectBidder
   * @apiGroup Order
   *
   * @apiParam {Number} order_id  订单id.
   * @apiParam {Number} server_openid  选中服务律师的openid.
   *
   * @apiSuccess {String} code S_Ok
   */
  static async selectBidder(context?: Context) {
    const orderRepo = this.getRepository<Order>(Order);

    const { order_id, server_openid } = context.request.body;

    if (!order_id || !server_openid) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let order = orderRepo.create({
      server_openid,
      status: ORDER_STATUS.pending
    });
    const res = await orderRepo.update(order_id, order);
    return {
      code: ResponseCode.SUCCESS.code,
      data: res,
      message: ResponseCode.SUCCESS.msg
    };
  }

  /**
   * @api {post} /order/updateStatus 更新order状态
   * @apiName updateStatus
   * @apiGroup Order
   *
   * @apiParam {Number} order_id  订单id.
   * @apiParam {Number} status  状态值. 抢单中 => 1, 待处理 => 2, 处理中 = 3, 完成 => 4, 申诉 => 5, 取消 => 6
   *
   * @apiSuccess {String} code S_Ok
   */
  static async changeOrderStatus(ctx?: Context) {
    const orderRepo = this.getRepository<Order>(Order);

    const { order_id, status } = ctx.request.body;

    // To Review, 判定状态流改变规则
    // const orderInfo  = await orderRepo.findOne(order_id);

    if (!status) {
      const error = {
        code: ResponseCode.ERROR_PARAMS.code,
        message: ResponseCode.ERROR_PARAMS.msg
      };
      throw new HttpException(error);
    }

    let order = new Order();
    order.status = status;
    const res = await orderRepo.update(order_id, order);
    return {
      code: ResponseCode.SUCCESS.code,
      data: res,
      message: ResponseCode.SUCCESS.msg
    };
  }
}
