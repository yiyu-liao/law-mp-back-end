import UserController from "@src/controller/user";
import LegalAdviceController from "@src/controller/legal-advice";

const legalAdvice = [
  {
    path: "/addAdvice",
    method: "post",
    action: LegalAdviceController.addAdvice
  },
  {
    path: "/getCustomerAllAdvices",
    method: "post",
    action: LegalAdviceController.getCustomerAllAdvices
  },
  {
    path: "/getAllAdvices",
    method: "get",
    action: LegalAdviceController.getAllAdvices
  },
  {
    path: "/replyAdvice",
    method: "post",
    action: LegalAdviceController.replyAdvice
  }
];

const user = [
  {
    path: "/register",
    method: "post",
    action: UserController.register
  },
  {
    path: "/getUserInfo",
    method: "post",
    action: UserController.getUserInfo
  }
];

export default [...user, ...legalAdvice];
