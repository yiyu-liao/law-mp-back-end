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
  },
  {
    path: "/user/relateReply",
    method: "post",
    action: UserController.getUserRelateReply
  }
];

const Advice = [
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
    path: "/advice/all",
    method: "get",
    action: LegalAdviceController.getAllAdvices
  },
  {
    path: "/advice/relateReplyUser",
    method: "post",
    action: LegalAdviceController.getAdivicesRelateReplyUser
  }
];

const Case = [
  {
    path: "/case/publish",
    method: "post",
    action: OrderServer.publicCase
  },
  {
    path: "/case/bid",
    method: "post",
    action: OrderServer.bidCase
  },
  {
    path: "/case/list",
    method: "post",
    action: OrderServer.getCaseList
  },
  {
    path: "/case/customerList",
    method: "post",
    action: OrderServer.getCustomerList
  },
  {
    path: "/case/lawyerList",
    method: "post",
    action: OrderServer.getLawyerList
  },
  {
    path: "/case/detail",
    method: "post",
    action: OrderServer.getCaseDetail
  },
  {
    path: "/case/selectBidder",
    method: "post",
    action: OrderServer.selectBidder
  }
];

export default [...user, ...Advice, ...Case];
