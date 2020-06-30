const { name } = require("./package.json");
const path = require("path");
// Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name,
      script: path.resolve(__dirname, "./dist/src/index.js"),
      instances: 2,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "root",
      key: "~/.ssh/id_rsa",
      host: "your remote ip",
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/DEPLOY-PROD",
      repo: "your repo",
      path: "/data/www/api-service",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production"
      }
    }
  }
};
