export { ResponseCode } from "./responseCode";

export enum PayOrderStatus {
  prepay,
  success,
  cancel,
  appeal,
  complete
}

export enum CaseStatus {
  bidding,
  pending,
  processing,
  appeal,
  pendingConfirm,
  complete
}

export enum AppealStatus {
  pending,
  success
}

export enum AdminUserStatus {
  disable,
  enable
}

export enum UserVerifyStatus {
  init = 1,
  applyVerify = 2,
  verify = 3
}
