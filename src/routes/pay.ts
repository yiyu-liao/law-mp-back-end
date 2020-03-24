import payServer from "@src/controller/pay";

const pay = [
  {
    path: "/pay/getPayParams",
    method: "post",
    action: payServer.getPayParams
  },
  {
    path: "/pay/noticeCallback",
    method: "post",
    action: payServer.payNoticeCallback
  },
  {
    path: "/pay/refundNoticeCallback",
    method: "post",
    action: payServer.refundNoticeCallback
  },
  {
    path: "/pay/applyRefund",
    method: "post",
    action: payServer.applyRefund
  },
  {
    path: "/pay/applyWithdrawal",
    method: "post",
    action: payServer.applyWithdrawal
  }
];

export default pay;
