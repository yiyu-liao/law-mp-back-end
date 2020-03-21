import payServer from "@src/controller/pay";

const pay = [
  {
    path: "/pay/getPayParams",
    method: "post",
    action: payServer.getPayParams
  },
  {
    path: "/pay/callback",
    method: "post",
    action: ""
  }
];

export default pay;
