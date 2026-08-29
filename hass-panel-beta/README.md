# Home OS Dev

Home OS 家庭中枢开发预览版，作为独立 Home Assistant 加载项运行，不会覆盖正式版 Hass Panel。

## 安装

1. 在 Home Assistant 打开“设置 → 加载项 → 加载项商店”。
2. 打开右上角菜单，选择“仓库”。
3. 添加：`https://github.com/zhouzhoubuchila/hass-panel#home-os-dev`
4. 刷新商店并选择 **Home OS Dev**。
5. 安装、启动，然后点击“打开 Web UI”。

首次进入后填写 Home Assistant 的局域网地址与长期访问令牌。不要使用 `localhost` 或 `127.0.0.1`。

## 数据隔离

加载项 slug 为 `home_os_dev`，配置写入其独立 `addon_config` 目录。卸载加载项前如需保留数据，请先创建 Home Assistant 备份。
