import { Context } from 'koa';
import tenPay from 'tenpay';

export default class PayService {
    readonly tenPay = new tenPay()

    static async pay() {}

    static async refund() {}

    static async transfers() {

    }

}