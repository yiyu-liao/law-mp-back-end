const env = process.env.NODE_ENV;

module.exports = {
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "Rootpwd123.",
  database: "law_mp",
  synchronize: true,
  logging: false,
  charset: "utf8mb4_unicode_ci",
  entities: ["src/entity/*{.ts,.js}"]
};
