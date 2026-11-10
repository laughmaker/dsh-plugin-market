# dsh-plugin-market

laughmaker 的 DSH（DeepSeek Harness）插件索引，格式为插件市场索引 **format 1**，由官方校验器 `@deepseek-ai/dsh-plugin-market-index` 验证。

## 索引地址

```
https://raw.githubusercontent.com/laughmaker/dsh-plugin-market/main/index.json
```

## 在 DSH 中使用

1. 打开 **Plugins → Discover**（插件 → 发现）。
2. 点 **索引源 / Index sources → Add index source**，粘贴上面的索引地址。
3. 刷新后即可看到本索引内的插件，点开条目可查看版本、兼容性与安装按钮。

> 索引源由使用者自行添加；本仓库是第三方社区索引，与 DeepSeek 官方无关。

## 当前收录

| 插件 | 说明 | 来源 |
| --- | --- | --- |
| `dsh-obsidian-tasks` | 把 Obsidian 库接入 DSH：六个面向模型的工具（list/add/complete/move/append/config）+ GUI 任务看板页 | npm `dsh-obsidian-tasks@0.15.10` |

## 发布新版本

插件详情见 [dsh-obsidian-tasks](https://github.com/laughmaker/dsh-obsidian-tasks)。

1. 在插件仓库构建并发布 npm：`pnpm build && npm publish`。
2. 取该版本在 npm 上的发布时间（Unix 秒）：
   `npm view dsh-obsidian-tasks time --json`。
3. 在 `index.json` 的 `plugins[].versions` 里**新增**一条
   `{ "version", "publishTimestamp", "source": { "type": "npm" }, "engines": { "dsh" } }`，
   旧版本保留（校验器要求精确 SemVer、不重复，自动按版本降序排列）。
4. 校验并推送：

```bash
pnpm install
pnpm validate
git commit -am "Add dsh-obsidian-tasks@<version>"
git push
```

## 格式要点（format 1）

- 顶层：`format: 1`、`title`（本地化文本，必须含 `en`）、可选 `description`、`metadata.categories/labels/sortKeys`、`plugins[]`。
- 插件：`name`（npm 包名）、`versions[]`（非空，`version` 精确 SemVer、`publishTimestamp` 为 Unix 秒整数且 < 10^11）。
- 来源：npm 为 `{ "type": "npm", "registry"?: url }`；Git 为 `{ "type": "git", "url": https 仓库地址, "commit": 40 位小写 SHA, "path"?: 包目录 }`。
- `icon` 可用相对路径（相对索引地址解析）或 `data:` 内联图（解码后 ≤ 32 KiB）。
- 未定义的成员会被丢弃；`engines.dsh` 为 SemVer 范围，用于 DSH 版本兼容提示。

## 校验

```bash
pnpm validate                                                    # 校验本地 index.json
node script/validate-index.mjs https://…/index.json              # 校验远端索引
```

校验器与 DSH 读取索引时使用同一套规则；通过即代表格式正确（它无法核实包内容与元数据是否一致，这部分由生成者负责）。
