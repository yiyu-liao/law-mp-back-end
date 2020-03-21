import * as _ from "lodash";

/**
 * 生成订单的编号order_sn
 * @returns {string}
 */
export function generateTradeNumber() {
  const date = new Date();
  return (
    date.getFullYear() +
    _.padStart(date.getMonth().toString(), 2, "0") +
    _.padStart(date.getDay().toString(), 2, "0") +
    _.padStart(date.getHours().toString(), 2, "0") +
    _.padStart(date.getMinutes().toString(), 2, "0") +
    _.padStart(date.getSeconds().toString(), 2, "0") +
    _.random(100000, 999999)
  );
}
