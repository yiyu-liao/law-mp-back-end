import * as _ from "lodash";
import bcrypt = require("bcrypt");

/**
 * 生成订单的编号order_sn
 * @returns {string}
 */
export function generateTradeNumber() {
  const date = new Date();
  return (
    date.getFullYear() +
    _.padStart(date.getMonth().toString(), 2, "0") +
    _.padStart(date.getDay().toString(), 2, "0") +
    _.padStart(date.getHours().toString(), 2, "0") +
    _.padStart(date.getMinutes().toString(), 2, "0") +
    _.padStart(date.getSeconds().toString(), 2, "0") +
    _.random(100000, 999999)
  );
}

export function createHttpResponse(code: string, msg: string, data?: any) {
  return {
    code,
    data,
    messgae: msg
  };
}

export function doCrypto(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (error, salt) => {
      if (error) reject("");
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) reject("");
        resolve(hash);
      });
    });
  });
}

export function comparePasword(fromPost: string, fromDatabase: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(fromPost, fromDatabase, (error, res) => {
      if (error) reject("");
      resolve(res);
    });
  });
}
