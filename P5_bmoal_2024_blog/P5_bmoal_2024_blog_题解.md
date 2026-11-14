# P5_bmoal_2024_blog — 题解

> 项目：P5 ｜ 指令：bmoal ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/11/18/CO/CO-p5-course/)

## 题解

> 如果你在课下加过 `bltzal`，那么这题就很简单了。在 CMP 中判断 1 的个数，如果符合标准，将 `Branch` 置 1，然后将 `Branch` 送入 CTRL 和 NPC，CTRL 负责根据 `Branch` 生成写入地址，如果符合条件就往 31 里写 PC+8，不符合就写入地址置 0。需要注意的是，`Branch` 信号需要随流水往下传。

（配合文末"条件跳转 + 条件连接"一节：让 `D_Branch` 随指令流水，CTRL 的写使能处与 `Branch` 相与；清空延迟槽时要带上 `stall` 判断。）

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
