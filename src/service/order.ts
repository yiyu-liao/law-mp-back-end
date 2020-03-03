import { Context } from 'koa';
import { getManager } from 'typeorm';

import Order, { ORDER_STATUS } from '@src/entity/order';
import Bidders from '@src/entity/bidders';

import { RequesetErrorCode } from "@src/constant";
import HttpException from "@src/utils/http-exception";

export default class OrderService {
    static getRepository(entity: any) {
        return getManager().getRepository(entity);
    }


    /**
     * @api {post} /order/publish 发布文书起草，案件委托等需求
     * @apiName publish
     * @apiGroup Order
     *
     * @apiParam {Number} c_openid  客户唯一openid.
     * @apiParam {String} description 客户需要填写等文字描述.
     * @apiParam {Number} response_time 客户要求的响应时间.
     * @apiParam {Number} limit_time 客户要求的完成期限.
     *
     * @apiSuccess {String} code 200
     */
    static async publishOrder(context?: Context) {
        const Repo = this.getRepository(Order);

        const { c_openid, description, response_time, limit_time } = context.request.body;

        if (!c_openid || !description || !response_time || !limit_time) {
            const error = {
                code: RequesetErrorCode.PARAMS_ERROR.code,
                msg: RequesetErrorCode.PARAMS_ERROR.msg
              };
              throw new HttpException(error);
        }

        const order = new Order();
        order.c_openid = c_openid;
        order.description = description;
        order.response_time = response_time;
        order.limit_time = limit_time;

        try {
            const result = await Repo.save(order);
            return {
                code: 200,
                data: result,
                msg: null
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
        const bidderRepo = this.getRepository(Bidders);

        const { order_id, l_openid, price } = context.request.body;

        if (!order_id || !l_openid || !price) {
            const error = {
                code: RequesetErrorCode.PARAMS_ERROR.code,
                msg: RequesetErrorCode.PARAMS_ERROR.msg
              };
              throw new HttpException(error);
        }

        let order = new Order();
        let bidder = new Bidders();

        order.id = order_id;

        bidder.l_opendid = l_openid;
        bidder.price = price;

        bidder.order = order;

        try {
            const res = await bidderRepo.save(bidder);
            return {
                code: 200,
                data: res,
                msg: ''
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
        const orderRepo = this.getRepository(Order);
        const { id } = context.request.body;

        if (!id) {
            const error = {
                code: RequesetErrorCode.PARAMS_ERROR.code,
                msg: RequesetErrorCode.PARAMS_ERROR.msg
              };
              throw new HttpException(error);
        }

        try {
            const orders = await orderRepo.findOne(id, { relations: ["bidders"] });
            return {
              code: 200,
              data: orders,
              msg: null
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
        const orderRepo = this.getRepository(Order);

        const { order_id, l_openid } = context.request.body;

        if (!order_id || !l_openid) {
            const error = {
                code: RequesetErrorCode.PARAMS_ERROR.code,
                msg: RequesetErrorCode.PARAMS_ERROR.msg
              };
              throw new HttpException(error);
        }

        let order = new Order();
        order.winner_openid = l_openid;
        order.status = ORDER_STATUS.pending;

        try {
            await orderRepo.update(order_id, order);
            return {
                code: 200,
                data: {},
                msg: ''
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