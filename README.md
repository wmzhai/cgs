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

## 4. Schema编写指南

### 4.1 命名规范

* 文件名小写开头驼峰形式文件，后缀为graphql
* add type时会自动添加id, createdAt和updatedAt，所以在编写inputSchema时不需要添加
* 字段名称小写开头驼峰形式

### 4.2 模型关系


类型之间有相互引用关系，这里可以使用特定的关联语法来描述这种关系，并说明如何在mongodb里面生成相应的数据结构。

**单关联字段 Singleton fields**

字段引用其它类型的单个实例：

- `@belongsTo` - 外键在这个类型中以`${fieldName}Id`形式保存
- `@hasOne` - 外键保存在被引用类型里的 the foreign key is stored on the referenced type as `${typeName}Id`. Provide the `"as": X` argument if the name is different. [NOTE: this is not yet fully implemented].

**多关联字段 Paginated fields**

字段引用其它类型的一个数组:

- `@belongsToMany` - there is a list of foreign keys stored on this type as `${fieldName}Ids` [this is the default]
- `@hasMany` - the foreign key is on the referenced type as `${typeName}Id`. Provide the `"as": X` argument if the name is different. (this is the reverse of `@belongsTo` in a 1-many situation).
- `@hasAndBelongsToMany` - the foreign key on the referenced type as `${typeName}Ids`. Provide the `"as": X` argument if the name is different. (this is the reverse of `@belongsToMany` in a many-many situation).


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
