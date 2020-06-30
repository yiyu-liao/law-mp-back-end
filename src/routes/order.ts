import OrderService from "@src/controller/order";

const pay = [
  {
    path: "/order/getPayParams",
    method: "post",
    action: OrderService.getPayParams
  },
  {
    path: "/order/payCallback",
    method: "post",
    action: OrderService.payNoticeCallback
  },
  {
    path: "/order/refundCallback",
    method: "post",
    action: OrderService.refundCallback
  },
  {
    path: "/order/applyRefund",
    method: "post",
    action: OrderService.applyRefund
  },
  {
    path: "/order/cancelAppeal",
    method: "post",
    action: OrderService.cancelAppeal
  },
  {
    path: "/order/applyWithdrawal",
    method: "post",
    action: OrderService.applyWithdrawal
  },
  {
    path: "/order/query",
    method: "post",
    action: OrderService.orderQuery
  },
  {
    path: "/order/confirmOrder",
    method: "post",
    action: OrderService.confirmOrder
  },
  {
    path: "/order/customerOrderList",
    method: "post",
    action: OrderService.getCustomerOrderList
  },
  {
    path: "/order/lawyerOrderList",
    method: "post",
    action: OrderService.getLawyerOrderList
  }
];

export default pay;
