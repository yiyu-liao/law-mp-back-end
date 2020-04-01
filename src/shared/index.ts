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

export function generatePassword(randomFlag, min, max, specialChar) {
  let result = "";
  let range = min;
  let arr = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];
  if (specialChar) {
    arr.concat([
      "!",
      "`",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "=",
      "_",
      "+",
      "~",
      ",",
      ".",
      "/",
      ";",
      "'",
      "[",
      "]",
      "\\",
      "<",
      ">",
      "?",
      ":",
      '"',
      "{",
      "}",
      "|"
    ]);
  }
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min; // 任意长度
  }
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    result += arr[pos];
  }
  if (
    result.match(".*[a-z]{1,}.*") &&
    result.match(".*[A-Z]{1,}.*") &&
    result.match(".*[0-9]{1,}.*")
  ) {
    return result;
  }
  return generatePassword(randomFlag, min, max, specialChar);
}

export function createHttpResponse(code: string, msg: string, data?: any) {
  return {
    code,
    data,
    message: msg
  };
}

export function doCrypto(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (error, salt) => {
      // if (error) reject();
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) reject();
        resolve(hash);
      });
    });
  });
}

export function comparePasword(
  fromPost: string,
  fromDatabase: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(fromPost, fromDatabase, (error, res) => {
      // if (error) reject();
      resolve(res);
    });
  });
}
