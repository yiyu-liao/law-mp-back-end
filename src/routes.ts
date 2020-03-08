import UserController from "@src/controller/user";
import LegalAdviceController from "@src/controller/legal-advice";
import OrderServer from '@src/controller/order'


const user = [
  {
    path: "/user/authSession",
    method: "get",
    action: UserController.authSession
  },
  {
    path: "/user/register",
    method: "post",
    action: UserController.register
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
    path: "/order/detail",
    method: "post",
    action: OrderServer.getOrderDetail
  },
  {
    path: "/order/selectBidder",
    method: "post",
    action: OrderServer.selectBidder
  }
]



export default [...user, ...legalAdvice, ...order];
