import LegalAdviceController from "@src/controller/advice";

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

export default Advice;
