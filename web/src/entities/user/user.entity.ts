import { userApi } from "./user.api";
import { userListConfig } from "./user.ui";
import { userViewConfig } from "./user.view";
import { userEditConfig } from "./user.edit";
import { userCreateConfig } from "./user.create";
import type { User } from "./user.types";

export const userEntity = {
  key: "users",
  pageName: "Users",

  api: userApi,
  routes: {
    list: "/users",
    create: "/users/create",
    view: (id: number) => `/users/${id}`,
    edit: (id: number) => `/users/${id}/edit`,
  },

  list: userListConfig,
  view: userViewConfig,
  edit: [userEditConfig],
  add: [userCreateConfig],

  toUpdate: (user: User) => ({
    firstName: user.firstName,
    secondName: user.secondName,
    lastName: user.lastName,
    email: user.email,
    contactNumber: user.contactNumber, // Already a number, no conversion needed
  }),
};