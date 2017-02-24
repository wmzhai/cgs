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
$ cgs add <path-to-schema.graphql>
```

### 由模板生成整个项目
```bash
$ cgs add <inputDir> <outputDir>
```

## 3. 开发

```bash
$ git clone https://github.com/wmzhai/cgs.git && cd cgs
$ yarn install
$ npm link
```


## 4. Schema编写指南

* 文件名小写开头驼峰形式文件，后缀为graphql
* add type时会自动添加id, createdAt和updatedAt，所以在编写inputSchema时不需要添加
* 字段名称小写开头驼峰形式