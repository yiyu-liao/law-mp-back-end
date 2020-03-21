import UserController from "@src/controller/user";

const user = [
  {
    path: "/user/authSession",
    method: "post",
    action: UserController.authSession
  },
  {
    path: "/user/update",
    method: "post",
    action: UserController.updateUser
  },
  {
    path: "/user/detail",
    method: "post",
    action: UserController.getUserInfo
  },
  {
    path: "/user/relateReply",
    method: "post",
    action: UserController.getUserRelateReply
  }
];

export default user;
