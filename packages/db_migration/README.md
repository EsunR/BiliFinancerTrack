# 数据库 Migration 指南

> 官方文档：https://www.sequelize.cn/other-topics/migrations

当你需要增删数据库的列时，直接在 Model 中增删对应的字段后，在执行 `sequelize.sync()` 后并不会将这些变更同步到现有的表中，因此我们必须创建一个 `Migrations` 操作来对已创建的数据库进行迁移升级。

`sequelize-cli` 可以帮助我们进行数据库迁移，以增删数据库字段为例，你需要执行以下操作：

## 生成一个新的 migration 记录

进入 `packages/db_migration` 目录下，调用 `pnpm exec sequelize-cli migration:create` 指令，同时要添加一个 `--name` 选项，其值可为当前操作的描述，如：

```sh
# 向 CaseUrls 表添加新列
pnpm exec sequelize-cli migration:create --name add_case_new_columns
```

之后会在 `db_migration/migrations` 目录下生成一个 `js` 文件，你需要在这个文件中写入对数据库表的操作，如：

```js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 为数据库添加 heighScore 列
    await queryInterface.addColumn("CaseUrls", "heightScore", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    // 为数据库添加 lowScore 列
    await queryInterface.addColumn("CaseUrls", "lowScore", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // 移除 note 列
    await queryInterface.removeColumn('CaseUrls', 'note'),
  },
};
```

## 应用最新的迁移

开发环境：根目录执行 `pnpm db:migrate:dev`

正式环境：output 目录下执行 `npm run db:migrate`

> 如果使用 pm2 且使用定义好的 `ecosystem.config.cjs` 来启动项目，每次启动应用会自动执行一次 migrate，不需要手动执行

Docker 环境：不需要手动执行
