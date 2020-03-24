import CaseServer from "@src/controller/case";

const Case = [
  {
    path: "/case/publish",
    method: "post",
    action: CaseServer.publicCase
  },
  {
    path: "/case/bid",
    method: "post",
    action: CaseServer.bidCase
  },
  {
    path: "/case/list",
    method: "post",
    action: CaseServer.getCaseList
  },
  {
    path: "/case/customerList",
    method: "post",
    action: CaseServer.getCustomerList
  },
  {
    path: "/case/lawyerList",
    method: "post",
    action: CaseServer.getLawyerList
  },
  {
    path: "/case/detail",
    method: "post",
    action: CaseServer.getCaseDetail
  },
  {
    path: "/case/selectBidder",
    method: "post",
    action: CaseServer.selectBidder
  },
  {
    path: "/case/updateStatus",
    method: "post",
    action: CaseServer.changeCaseStatus
  }
];

export default Case;
