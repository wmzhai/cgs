# Create GraphQL Server


## 1. 安装
 
```bash
$ brew install yarn
$ npm i -g cgs
```

## 2. 使用

### 初始化空项目
```bash
$ cgs init <project-directory>
```
### 添加类型
```bash
$ cd <project-directory>
$ cgs add <path-to-schema.graphql>
```

### 由模板生成整个项目
```bash
$ cd <project-directory>
$ cgs add <inputDir> 
```

## 3. 开发

```bash
$ git clone https://github.com/wmzhai/cgs.git && cd cgs
$ yarn install
$ npm link
```
*注意：仅在node版本7.6.0以上支持vscode调试*

## 4. Schema编写指南

### 4.1 命名规范

* 文件名小写开头驼峰形式文件，后缀为graphql
* add type时会自动添加id, createdAt和updatedAt，所以在编写inputSchema时不需要添加
* 字段名称小写开头驼峰形式

### 4.2 关联关系


类型之间有相互引用关系，这里可以使用特定的关联语法来描述这种关系，并说明如何在mongodb里面生成相应的数据结构。

**单关联字段 Singleton fields**

字段引用其它类型的单个实例：

- `@belongsTo` - 外键在这个类型中以`${fieldName}Id`形式保存
- `@hasOne` - 外键保存在被引用类型里的 the foreign key is stored on the referenced type as `${typeName}Id`. Provide the `"as": X` argument if the name is different. [NOTE: this is not yet fully implemented].

**多关联字段 Paginated fields**

字段引用其它类型的多个示例:

- `@belongsToMany` - 在这个类里保存了一个外键列表`${fieldName}Ids`（默认形式）
- `@hasMany` - 外键以`${typeName}Id`形式保存在被引用类型里面。如果名称不一样，则使用`"as": X`参数来表示，这个和1对多的`@belongsTo`相反。
- `@hasAndBelongsToMany` - 在被引用类型里面，外键以`${typeName}Ids`形式表示. 如果名称不一样，则使用`"as": X`参数来表示，这个是多对多的`@belongsToMany`相反。

```graphql
type User {
  username: String!
  bio: String

  tweets: [Tweet!] @hasMany(as: "author")
  liked: [Tweet!] @belongsToMany

  following: [User!] @belongsToMany
  followers: [User!] @hasAndBelongsToMany(as: "following")
}

type Tweet {
  author: User! @unmodifiable
  body: String!

  likers: [User!] @hasAndBelongsToMany(as: "liked")
}
```
