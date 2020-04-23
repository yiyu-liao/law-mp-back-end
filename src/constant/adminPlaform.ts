// 所有的菜单数据
const AdminMenu = [
  {
    id: 1,
    title: "首页",
    icon: "icon-home",
    url: "/home",
    parent: null,
    desc: "首页",
    sorts: 0,
    conditions: 1
  },
  {
    id: 2,
    title: "系统管理",
    icon: "icon-setting",
    url: "/system",
    parent: null,
    desc: "系统管理目录分支",
    sorts: 1,
    conditions: 1
  },
  {
    id: 3,
    title: "用户管理",
    icon: "icon-user",
    url: "/useradmin",
    parent: 2,
    desc: "系统管理/用户管理",
    sorts: 0,
    conditions: 1
  },
  {
    id: 4,
    title: "认证管理",
    icon: "icon-team",
    url: "/roleadmin",
    parent: 2,
    desc: "系统管理/认证管理",
    sorts: 1,
    conditions: 1
  },
  {
    id: 5,
    title: "申诉管理",
    icon: "icon-safetycertificate",
    url: "/appealAdmin",
    parent: 2,
    desc: "系统管理/申诉管理",
    sorts: 2,
    conditions: 1
  }
  // {
  //   id: 6,
  //   title: "菜单管理",
  //   icon: "icon-appstore",
  //   url: "/menuadmin",
  //   parent: 2,
  //   desc: "系统管理/菜单管理",
  //   sorts: 3,
  //   conditions: 1
  // }
];

// 所有的权限数据
const AdminPower = [
  {
    id: 1,
    menu: 3,
    title: "新增",
    code: "user:add",
    desc: "用户管理 - 添加权限",
    sorts: 1,
    conditions: 1
  },
  {
    id: 2,
    menu: 3,
    title: "修改",
    code: "user:up",
    desc: "用户管理 - 修改权限",
    sorts: 2,
    conditions: 1
  },
  {
    id: 3,
    menu: 3,
    title: "查看",
    code: "user:query",
    desc: "用户管理 - 查看权限",
    sorts: 3,
    conditions: 1
  },
  {
    id: 4,
    menu: 3,
    title: "删除",
    code: "user:del",
    desc: "用户管理 - 删除权限",
    sorts: 4,
    conditions: 1
  },
  {
    id: 5,
    menu: 3,
    title: "分配角色",
    code: "user:role",
    desc: "用户管理 - 分配角色权限",
    sorts: 5,
    conditions: 1
  }
];
// 所有的角色数据
const AdminRole = [
  {
    id: 1,
    title: "超级管理员",
    desc: "超级管理员拥有所有权限",
    sorts: 1,
    conditions: 1,
    menuAndPowers: [
      { menuId: 1, powers: [] },
      { menuId: 2, powers: [] },
      { menuId: 3, powers: [1, 2, 3, 4, 5] },
      { menuId: 4, powers: [6, 7, 8, 9, 18] },
      { menuId: 5, powers: [10, 11, 12, 13] },
      { menuId: 6, powers: [14, 15, 16, 17] }
    ]
  }
];

export { AdminMenu, AdminPower, AdminRole };
