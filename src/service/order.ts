import { Context } from 'koa';
import { getManager, Repository } from 'typeorm';

import Order, { ORDER_STATUS } from '@src/entity/order';
import Bidders from '@src/entity/bidders';
import WxService from './wx';

import { ResponseCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

export default class OrderService {
    static getRepository<T>(target: any): Repository<T> {
        return getManager().getRepository(target);
    }


    /**
     * @api {post} /order/publish 发布文书起草，案件委托等需求
     * @apiName publish
     * @apiGroup Order
     *
     * @apiParam {Number} c_openid  客户唯一openid.
     * @apiParam {Number} order_type  订单类型，1 => 文书起草，2 => 案件委托， 3 => 法律顾问， 4 => 案件查询
     * @apiParam {Object} extra_info 自定义的表单提交数据
     * @apiParam {String} description 客户需要填写等文字描述
     * @apiParam {Number} response_time 客户要求的响应时间
     * @apiParam {Number} limit_time 客户要求的完成期限
     *
     * @apiSuccess {String} code 200
     */
    static async publishOrder(context?: Context) {
        const Repo = this.getRepository<Order>(Order);

        const { c_openid, order_type, description, extra_info, response_time, limit_time } = context.request.body;

        if (!c_openid || !order_type || !description || !response_time || !limit_time) {
            const error = {
                code: ResponseCode.ERROR_PARAMS.code,
                msg: ResponseCode.ERROR_PARAMS.msg
              };
              throw new HttpException(error);
        }

        try {
            const order = Repo.create({
                c_openid,
                order_type,
                extra_info,
                description,
                response_time,
                limit_time
            });

            const result = await Repo.save(order);
            return {
                code: ResponseCode.SUCCESS.code,
                data: result,
                msg: ResponseCode.SUCCESS.msg
            }

        }catch (e) {
            const error = {
                code: e.code,
                msg: e.message
            };
            throw new HttpException(error);
        }
        
    }


    
    /**
     * @api {post} /order/bid 律师进行对需求进行抢单
     * @apiName bid
     * @apiGroup Order
     *
     * @apiParam {Number} order_id  订单id.
     * @apiParam {Number} l_openid  律师唯一openid.
     * @apiParam {Number} price 报价
     *
     * @apiSuccess {String} code 200
     */
    static async bidOrder(context?: Context) {
        const bidderRepo = this.getRepository<Bidders>(Bidders);

        const { order_id, l_openid, price } = context.request.body;

        if (!order_id || !l_openid || !price) {
            const error = {
                code: ResponseCode.ERROR_PARAMS.code,
                msg: ResponseCode.ERROR_PARAMS.msg
              };
              throw new HttpException(error);
        }

        
        try {
            let order = new Order();
            order.id = order_id;

            let bidder = bidderRepo.create({
                l_openid,
                price,
                order
            })

            const res = await bidderRepo.save(bidder);
            return {
                code: ResponseCode.SUCCESS.code,
                data: res,
                msg: ResponseCode.SUCCESS.msg
            }

        }catch (e) {
            const error = {
                code: e.code,
                msg: e.message
            };
            throw new HttpException(error);
        }
    }


    /**
     * @api {post} /order/detail 获取订单详情
     * @apiName getOrderDetail
     * @apiGroup Order
     *
     * @apiParam {Number} id  订单id.
     *
     * @apiSuccess {String} code 200
     */
    static async getOrderDetail(context?: Context) {
        const orderRepo = this.getRepository<Order>(Order);
        const { id } = context.request.body;

        if (!id) {
            const error = {
                code: ResponseCode.ERROR_PARAMS.code,
                msg: ResponseCode.ERROR_PARAMS.msg
              };
              throw new HttpException(error);
        }

        try {
            const orders = await orderRepo.findOne(id, { relations: ["bidders"] });
            return {
              code: ResponseCode.SUCCESS.code,
              data: orders,
              msg: ResponseCode.SUCCESS.msg
            };

        }catch (e) {
            const error = {
                code: e.code,
                msg: e.message
            };
            throw new HttpException(error);
        }
    }

    /**
     * @api {post} /order/selectBidder 客户选中律师
     * @apiName selectBidder
     * @apiGroup Order
     *
     * @apiParam {Number} order_id  订单id.
     * @apiParam {Number} l_openid  选中律师的openid.
     *
     * @apiSuccess {String} code 200
     */
    static async selectBidder(context?: Context) {
        const orderRepo = this.getRepository<Order>(Order);

        const { order_id, l_openid } = context.request.body;

        if (!order_id || !l_openid) {
            const error = {
                code: ResponseCode.ERROR_PARAMS.code,
                msg: ResponseCode.ERROR_PARAMS.msg
              };
              throw new HttpException(error);
        }

        try {
            let order = orderRepo.create({
                winner_openid: l_openid,
                status: ORDER_STATUS.pending
            });
            const res = await orderRepo.update(order_id, order);
            return {
                code: ResponseCode.SUCCESS.code,
                data: res,
                msg: ResponseCode.SUCCESS.msg
            }

        }catch (e) {
            const error = {
                code: e.code,
                msg: e.message
            };
            throw new HttpException(error);
        }
    }


    /**
     * @api {post} /order/updateStatus 更新order状态
     * @apiName updateStatus
     * @apiGroup Order
     *
     * @apiParam {Number} order_id  订单id.
     * @apiParam {Number} status  状态值. 抢单中 => 1, 待处理 => 2, 处理中 = 3, 完成 => 4, 申诉 => 5, 取消 => 6
     *
     * @apiSuccess {String} code 200
     */
    static async changeOrderStatus(ctx?: Context) {

        const orderRepo = this.getRepository<Order>(Order);

        const { order_id, status } = ctx.request.body;

        // To Review, 判定状态流改变规则
        // const orderInfo  = await orderRepo.findOne(order_id);

        if (!status) {
            const error = {
                code: ResponseCode.ERROR_PARAMS.code,
                msg: ResponseCode.ERROR_PARAMS.msg
              };
              throw new HttpException(error);
        }

        try {
            let order = new Order();
            order.status = status;
            const res = await orderRepo.update(order_id, order);
            return {
                code: ResponseCode.SUCCESS.code,
                data: res,
                msg: ResponseCode.SUCCESS.msg
            }

        }catch (e) {
            const error = {
                code: e.code,
                msg: e.message
            };
            throw new HttpException(error);
        }
    }


    
}