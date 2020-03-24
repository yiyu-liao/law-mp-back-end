export { ResponseCode } from "./responseCode";

export enum PayOrderStatus {
  prePay,
  success,
  cancel,
  appeal,
  complete
}

export enum CaseStatus {
  bidding,
  pending,
  processing,
  complete,
  appeal,
  cancel
}

export enum AppealStatus {
  pending,
  success
}
