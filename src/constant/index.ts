export { ResponseCode } from "./responseCode";

export * from "./adminPlaform";

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
  complete,
  cancel
}

export enum AppealStatus {
  pending,
  cancel,
  agree,
  reject
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
