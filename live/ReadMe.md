# 运行步骤

- 在 student_live 文件夹下
- 解压 node_modules.rar 到当前目录下 node_modules 文件夹
- 运行

```
npm run electron:serve
```

- 运行完成后关闭，将 package 文件夹下的 electron-v8.2.3-win32-x64.zip 文件拷贝到 c://用户/Administrator/AppData/Local/electron/ 下
- 将 package 文件夹下的 Cache.rar 文件拷贝并解压到 c://用户/Administrator/AppData/Local/electron-builder/ 下(没有就新建文件夹)
- 运行

```
npm run electron:build
```

- 等待出现 build complete 后，说明打包功能 OK

# 开发

- 运行

```
npm install
```

- vue 开发

```
npm run serve
```

- vue 打包

```
npm run build
```

- electron 开发

```
npm run electron:serve
```

- electron 打包

```
npm run electron:build
```
