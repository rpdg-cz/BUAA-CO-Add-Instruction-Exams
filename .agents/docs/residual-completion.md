# 残题补全与指令命名（2026-11-17）

## 目标与边界

用户授权为34条归档记录补充最小必要条件，使每道题及其子题可以独立解答，并将分类改名为“残题补全”。此前要求保留未决、不自行补题的限制在此范围内被新要求取代。补全不是重新考据：已有明确行为尽量保留，冲突处选定一套一致规则；补充条件在题面中清楚列出，历史来源和未决证据留在隐藏元数据。

补全涵盖接口和采样时刻、输入范围、完整状态转移、计数边界、算法输出顺序，以及MIPS符号性、位宽、访存、延迟槽、异常优先级和撤销历史。题解必须与补全条件一致，不能继续要求读者自行选定行为。原来缺题解的条目补上题解。34条中包含1条博主自拟设想，其非考题身份仍由来源数据和管理界面表达。

## 分类与存储

- 普通题状态保持 `complete`，根目录存放；补全题状态为 `supplemented`，存放于 `supplemented/<id>/`。
- 管理页筛选、列表、详情、编辑及README索引统一显示“残题补全”；旧 `incomplete` 容器不再被扫描，名称仍保留禁止，避免被当作普通题目管理。
- `.exercise.json.source` 和 `editorial` 原样保留；新增 `completion.date` 及 `completion.conditions`。补全记录随整题迁移、删除，继续不进入附件或API DTO。
- 题目ID保持稳定；唯独本轮用户另行要求的无名指令需要用助记符替代文字描述，并同步目录、题面、题解、索引及相对链接。本地已改为`lpx`的名称保留并补齐文件名。

## 验证

两组独立复审覆盖34题及其题解，检查规则完整性、边界和代表性例子。复审保留了Gray原SVG的源GPR[rt]、仅累计Gray高位及大于比较，仅补sum初值和比较编号的含义；另修正numberNest样例定位及Verilog保留字端口名。

本地全量74项测试通过、0跳过，包含真实Toolkit Worker与Edge浏览器。管理回归覆盖分类区分、中文路径、完整读写、目录迁移、隐藏补全记录及浏览器渲染；真实题库检查要求每份补全题均有明确条件、元数据和题解。93份source/editorial与基线深比较相同；15份命名及全库相对链接检查通过。自动CI覆盖Windows/Linux及Node 18/22/26。

## 新助记符

保留阶段及年份部分，将旧ID中描述功能的部分替换为以下助记符，题面增加对应汇编格式。已知具名指令保持原名；`Gray_code`也改为可直接使用的助记符`bgc`。CP0区间限制与Watch是系统设计题，不视作无名指令。

| 原名称 | 助记符 | 英文释义 | 格式 |
| --- | --- | --- | --- |
| Gray_code | bgc | Branch on Gray-code Comparison | `bgc rt, offset` |
| 低位清零换一 | sloz | Set Low-order Zeros | `sloz rd, rs, rt` |
| 偶数位异或 | xore | XOR Even Bits | `xore rd, rs, rt` |
| 区间地址写31号 | lwad | Load Word with Address-selected Destination | `lwad rt, offset(base)` |
| 压栈跳转 | jsp | Jump and Stack Push | `jsp imm26` |
| 同符号跳转 | bsnz | Branch on Same-sign Nonzero | `bsnz rs, rt, offset` |
| 异或质数寄存器 | lwse | Load Word with Sum-selected Even Register | `lwse rt, offset(base)` |
| 按奇偶循环移位 | rotp | Rotate by Parity | `rotp rd, rs, rt` |
| 比较写45号 | lwcmp | Load Word and Compare | `lwcmp rt, offset(base)` |
| 负字节写base | lbnd | Load Byte with Negative-selected Destination | `lbnd rt, offset(base)` |
| 较小偶数跳转链接 | bmel | Branch on Minimum Even and Link | `bmel rs, rt, offset` |
| 零值跳转链接 | jzal | Jump on Zero and Link | `jzal rs, rt` |
| 条件写rd | movp | Move if Positive | `movp rd, rs, rt` |
| 负值变距跳转链接 | bnvl | Branch on Negative with Variable Distance and Link | `bnvl rs, rt, offset` |
| 跳转并链接比较 | bcl | Branch Comparison and Link | `bcl rs, rt, offset` |

这些名称用于本练习集的汇编表达。旧名称中的“异或质数寄存器”与已整理的实际运算不符，新名`lwse`按和选偶数编号的行为命名。本地已有的`P6_lpx_2024_blog`更名沿用，并同步其原先仍含LoadPrimeXor的文件名。
