export { ResponseCode } from "./responseCode";

export enum PayOrderStatus {
  prePay,
  success,
  cancel,
  appeal
}

export enum CaseStatus {
  bidding,
  pending,
  processing,
  complete,
  appeal,
  cancel
}
