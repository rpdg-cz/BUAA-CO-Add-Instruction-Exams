# P4_bsoal_2020_blog — 题解

> 项目：P4 ｜ 指令：bsoal ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p4/)

## 题解

- 用 `always @(*)` + 组合逻辑（或 `function`）统计 `GRF[rs]` 中 1 的个数并判奇偶。
- 跳转目标与链接值：跳转时 `GRF[31] = PC + 4`（按 RTL 照录，注意与 bgezal 类指令的 `PC + 8` 不同）。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
