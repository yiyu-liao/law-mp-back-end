import AdminController from "@src/controller/admin";

const Admin = [
  {
    path: "/admin/login",
    method: "post",
    action: AdminController.login
  },
  {
    path: "/admin/addUser",
    method: "post",
    action: AdminController.addUser
  },
  {
    path: "/admin/deleteUser",
    method: "post",
    action: AdminController.deleteUser
  },
  {
    path: "/admin/userList",
    method: "post",
    action: AdminController.getUserList
  },
  {
    path: "/admin/resetPassword",
    method: "post",
    action: AdminController.resetPassword
  },
  {
    path: "/admin/updateStatus",
    method: "post",
    action: AdminController.updateStatus
  },
  {
    path: "/admin/updateBaseInfo",
    method: "post",
    action: AdminController.updateBaseInfo
  },
  {
    path: "/admin/appealList",
    method: "post",
    action: AdminController.getAppealList
  },
  {
    path: "/admin/refund",
    method: "post",
    action: AdminController.refund
  },
  {
    path: "/admin/refundCallback",
    method: "post",
    action: AdminController.refund
  },
  {
    path: "/admin/clientVerifyUserList",
    method: "post",
    action: AdminController.clientVerifyUserList
  }
];

export default Admin;
