export const ResponseCode = {
  SUCCESS: {
    code: "S_Ok",
    msg: "操作成功"
  },

  ERROR_PARAMS: {
    code: "Error_Params",
    msg: "请求参数错误或缺失"
  },

  USER_NOT_EXIT: {
    code: "USER_NOT_EXIT",
    msg: "用户不存在, 请重新注册"
  },

  PAY_SIGN_ERROR: {
    code: "PAY_SIGN_ERROR",
    msg: "调起微信支付签名错误"
  },

  BALANCE_INSUFFICIENT: {
    code: "BALANCE_INSUFFICIENT",
    msg: "提现余额不足"
  }
};
