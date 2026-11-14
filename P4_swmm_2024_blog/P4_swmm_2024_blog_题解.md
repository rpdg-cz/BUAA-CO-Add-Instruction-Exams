# P4_swmm_2024_blog — 题解

> 项目：P4 ｜ 指令：swmm ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/11/12/CO/CO-p4-course/)

## 题解

> 我的 DM 模块设计的比较复杂，有 3 个控制信号：`MemWr`, `DMRDOp`, `DMWDOp`，分别代表使能、读模式、写模式，因此我只需要加一个写模式即可，if-else 判断全部在 DM 模块中完成。

（即：不必改数据通路，只在 DM 里按新 opcode 增加一种写模式。）

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
