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
    path: "/admin/agreeAppeal",
    method: "post",
    action: AdminController.agreeAppealCase
  },
  {
    path: "/admin/rejectAppeal",
    method: "post",
    action: AdminController.rejectAppealCase
  },
  {
    path: "/admin/refund",
    method: "post",
    action: AdminController.refund
  },
  {
    path: "/admin/clientVerifyUserList",
    method: "post",
    action: AdminController.clientVerifyUserList
  },
  {
    path: "/admin/getSwiperImages",
    method: "get",
    action: AdminController.getSwiperImages
  },
  {
    path: "/admin/updateSwiperImages",
    method: "post",
    action: AdminController.updateSwiperImage
  },

  {
    path: "/admin/getMenusById",
    method: "post",
    action: AdminController.getMenusById
  },
  {
    path: "/admin/getPowerById",
    method: "post",
    action: AdminController.getPowerById
  },
  {
    path: "/admin/getRoleById",
    method: "post",
    action: AdminController.getRoleById
  }
];

export default Admin;
