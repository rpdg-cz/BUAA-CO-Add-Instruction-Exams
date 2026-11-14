# 本地题目管理页面

一个本地 Web 页面，用来浏览、检索和维护本仓库的加指令练习。
后端只使用 Node.js 内置模块，浏览器端随仓库附带 DOMPurify，不需要 `npm install`、构建或访问 CDN。

## 快速开始

```bash
node tools/exercise-web/server.js
```

然后打开 <http://127.0.0.1:8787/>。管理入口是 <http://127.0.0.1:8787/#admin>。

需要 Node.js 18 或更新版本。服务默认直接读写本仓库里的题目目录，也可以用 `CO_REPO_ROOT` 指向其他题库。这个独立网页工具需要命令行 Node；在 VS Code 插件中加载指令脚本仍只使用 VS Code 自带的运行时。

## 能做什么

**浏览**

- 左侧列出 Pre、P0～P7 及 P5-P6 条目，支持关键字、阶段和来源/完整性筛选。中文目录和中文题解附件均可管理。
- 右侧渲染题面（Markdown + 题面里的 HTML 表格）、查看 JS/TS 定义、下载 `.class` 等附件。题面里的本题相对文件链接会指向附件接口。
- **查看原题**：从题面首行的 `> 项目：… ｜ 题目 ID：… ｜ 来源 PieId：…` 还原课程平台链接，可直接跳回原题页面，另有「复制链接」按钮。

**管理模式**

- 新增题目：填写题目 ID、题面和状态，可同时上传附件；有指令定义时再填写脚本文件名、语言和源码，没有脚本的博客题可全部留空。
- 编辑题面 / JS/TS 源码、重命名脚本文件、删除附件。编辑已有脚本时保留原语言和扩展名。
- 删除题目（直接删除目录，误删可用 `git checkout` 恢复）。
- **同步 README 索引**：按目录重新生成 `README.md` 的题目表格，保留表格前后的人工说明；列表页会提示索引是否落后。存在多个索引表格时会拒绝猜测。

### 博客与残题

根目录放行为可还原的题目，`incomplete/<题目ID>/` 放关键行为缺失或冲突的记录。仅定向读取这两层，不任意递归扫描。题目 ID 在两处必须唯一；API 始终使用原目录 basename 作为 ID，不接收用户提供的路径。

状态 `complete` / `incomplete` 控制所在目录。改变状态会移动整题，保持题面、题解、脚本和附件同目录；README 同步使用实际相对路径。`incomplete` 容器本身不能作为题目删除或修改。缺 opcode/funct 不作为判残依据，管理工具也不会从题名猜测行为。

博客详情显示来源作者、年份及原博客链接，不伪造课程 ProblemId。博主自拟资料单独标明，不当作往届考题。题解作为普通 Markdown 附件管理，题面中的同目录链接可直接下载。

### 脚本文件名和助记符

页面管理的是源码文件，不执行用户脚本。**插件实际注册的助记符由源码中的 `mnemonic`（及 `aliases`）决定**；一个入口也可以导出多个定义，文件名不决定助记符。

将 `rlb.ts` 重命名为 `rlb2.ts` 后，原定义仍是 `rlb`。若要修改指令名称，请同时在源码中编辑定义及相关引用，再在 CPU 工作区使用插件验证。管理页面不会尝试用文本替换改写任意 JS/TS，也不会把保存成功当作语义校验通过。已有题目的 `.class` 是历史附件，重命名脚本不会修改 Java 类名、机器码或指令行为。

## 数据与约定

页面不维护数据库，题目目录就是唯一数据源，读到的内容和 `git` 里的完全一致。

| 约定 | 说明 |
| --- | --- |
| 目录名 | 即题目 ID，如 `P5_L6_lbget_2022` 或 `P0_投票表决器_2021_blog`；允许中英文字母、数字、`_`、`.`、`-`，拒绝路径分隔符、隐藏名及 Windows 设备名 |
| 题面 | `<目录名>.md`，首行 `# 标题`，第二段 `> 项目：… ｜ 题目 ID：… ｜ 来源 PieId：… ｜ 类型：…` |
| JS/TS 定义 | 目录内唯一的 `.js` 或 `.ts` 入口（不含 `.d.ts`）；助记符以源码为准，`.mjs` / `.cjs` 不作为插件入口 |
| 附件 | 其余文件，通常为 `<指令名>.class` |

README 表格包含实际路径、阶段、状态、来源、脚本与附件。行序为：Pre、P0～P7 → `_L<编号>`（无 L 编号者排在该阶段后面）→ 目录名；P5-P6 保留跨度并在 P5 一组排序。

## 配置

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `8787` | 监听端口 |
| `HOST` | `127.0.0.1` | 监听地址 |
| `CO_ADMIN_TOKEN` | 空 | 设置后，所有写操作都要带 `X-Admin-Token` 请求头，页面在管理栏填写 |
| `CO_PROBLEM_BASE_URL` | `http://cscore.buaa.edu.cn/#/problem` | 「查看原题」链接的前缀 |
| `CO_REPO_ROOT` | 仓库根目录 | 指向别的题目目录时使用 |

## 安全边界

- 默认只监听 `127.0.0.1`，不对局域网开放。
- 未设置 `CO_ADMIN_TOKEN` 时，写操作只接受来自本机回环地址的请求；即使误把 `HOST` 改成 `0.0.0.0`，远程写操作也会被拒绝，除非显式配置令牌。
- 写请求必须来自同源页面，并带 `X-Requested-With: exercise-web`；命令行客户端没有 `Origin` 时也需带此头。跨源请求、异常 Host 和跨站 Fetch Metadata 会被拒绝。JSON 创建/更新接口只接受 `application/json` 对象。
- 题面 HTML 由本地 DOMPurify 清理后显示，去除可执行内容及危险链接，并配合响应 CSP。课程表格仍可显示；原题面的任意样式不保证完整保留。
- 题目 ID、文件名做白名单校验，所有接口共享题目目录资格与文件类型检查；`tools`、`node_modules`、`incomplete` 容器和隐藏目录不能作为题目。拒绝符号链接、junction 和硬链接，避免改写仓库外文件。
- 同一题目的下载和修改按读写队列协调。下载释放文件句柄后再删除、覆盖或移档，避免 Windows 文件处于待删除状态时的元数据错误；不同题目仍可并行。
- README 同样拒绝链接文件。输入校验在写入前完成，单个文件通过临时文件替换；这不提供跨文件的数据库事务，磁盘故障仍需从 Git 恢复。

例如，在 PowerShell 中管理另一份题库：

```powershell
$env:CO_REPO_ROOT = 'E:\课程资料\加指令练习'
node tools/exercise-web/server.js
```

## 测试

```bash
node tools/exercise-web/run-tests.js
```

覆盖题目排序与原题链接解析、JS/TS 增删改查、大小写改名、非法输入不落盘、路径及链接边界、README 内容保留与幂等性，以及 HTTP 来源/文件/配置回归。其中一条用例校验本仓库的 README 索引，新增题目后需同步。

GitHub Actions 在 Windows / Linux 上分别运行 Node 18、22、26 回归，浏览器和外部 Toolkit 集成按下述可用条件运行。

真实插件兼容测试可指定包含已构建 Worker 的 Toolkit 仓库：

```powershell
$env:CO_TOOLKIT_ROOT = 'E:\VSCode\BUAA-CO\extension'
node tools/exercise-web/run-tests.js
```

外部集成测试需使用支持原生 TS 擦除的 Node（建议与当前 VS Code 相同版本），并先构建 Toolkit；未指定路径时跳过该项。浏览器净化回归默认使用 Windows Edge，其他 Chromium 浏览器可通过 `EXERCISE_WEB_BROWSER` 指定可执行文件路径，不可用时会说明跳过原因。浏览器库来源、许可证和更新方法见 [public/vendor/README.md](public/vendor/README.md)。

## 目录结构

```text
tools/exercise-web/
├── server.js            HTTP 服务、路由与静态资源
├── lib/
│   ├── exercises.js     题目目录的读取、校验与增删改
│   ├── store-files.js   普通文件边界、安全保存与重命名
│   ├── http-security.js Host、来源和响应头策略
│   ├── readme.js        README 索引表格的生成与同步
│   └── markdown.js      题面渲染（Markdown + 内嵌 HTML）
├── public/              浏览与管理页面
└── test/                冒烟测试
```
