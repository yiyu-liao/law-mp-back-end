import OrderServer from '@src/service/order';

export default class OrderController {
    static async publicOrder(ctx) {
        ctx.body = await OrderServer.publishOrder(ctx);
    }
    static async bidOrder(ctx) {
        ctx.body = await OrderServer.bidOrder(ctx);
    }
    static async selectBidder(ctx) {
        ctx.body = await OrderServer.selectBidder(ctx);
    }
    static async getOrderDetail(ctx) {
        ctx.body = await OrderServer.getOrderDetail(ctx);
    }

}