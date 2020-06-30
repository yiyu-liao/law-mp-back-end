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
    path: "/case/updateBidPrice",
    method: "post",
    action: CaseServer.updateBidPrice
  },
  {
    path: "/case/cancelBid",
    method: "post",
    action: CaseServer.cancelBid
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
    path: "/case/lawyerBidCaseList",
    method: "post",
    action: CaseServer.getLawyerBidCaseList
  },
  {
    path: "/case/detail",
    method: "post",
    action: CaseServer.getCaseDetail
  },
  {
    path: "/case/updateCaseInfo",
    method: "post",
    action: CaseServer.updateCaseInfo
  }
];

export default Case;
