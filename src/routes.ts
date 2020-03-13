import UserController from "@src/controller/user";
import LegalAdviceController from "@src/controller/legal-advice";
import OrderServer from "@src/controller/order";

const user = [
  {
    path: "/user/authSession",
    method: "post",
    action: UserController.authSession
  },
  {
    path: "/user/update",
    method: "post",
    action: UserController.updateUser
  },
  {
    path: "/user/detail",
    method: "post",
    action: UserController.getUserInfo
  }
];

const legalAdvice = [
  {
    path: "/advice/publish",
    method: "post",
    action: LegalAdviceController.publishAdvice
  },
  {
    path: "/advice/reply",
    method: "post",
    action: LegalAdviceController.replyAdvice
  },
  {
    path: "/advice/detail",
    method: "post",
    action: LegalAdviceController.getAdviceDetail
  },
  {
    path: "/advice/customer",
    method: "post",
    action: LegalAdviceController.getCustomerAllAdvices
  },
  {
    path: "/advice/lawyer",
    method: "post",
    action: LegalAdviceController.getLawyerReplyAdvice
  },
  {
    path: "/advice/all",
    method: "get",
    action: LegalAdviceController.getAllAdvices
  }
];

const order = [
  {
    path: "/order/publish",
    method: "post",
    action: OrderServer.publicOrder
  },
  {
    path: "/order/bid",
    method: "post",
    action: OrderServer.bidOrder
  },
  {
    path: "/order/list",
    method: "post",
    action: OrderServer.getOrderList
  },
  {
    path: "/order/detail",
    method: "post",
    action: OrderServer.getOrderDetail
  },
  {
    path: "/order/selectBidder",
    method: "post",
    action: OrderServer.selectBidder
  }
];

export default [...user, ...legalAdvice, ...order];
