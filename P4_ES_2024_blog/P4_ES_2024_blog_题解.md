# P4_ES_2024_blog — 题解

> 项目：P4 ｜ 指令：ES ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/11/12/CO/CO-p4-course/)

## 题解

> 四不像指令，好吧其实和 Branch 挺像的。关键在于如何区分分支和写入操作。由于我的所有 Branch 指令都在 ALU 中进行比较，并将比较结果通过 Branch 端口进行输出，于是对于本条指令，我通过 ALU 对减法溢出进行判断，并将是否溢出通过 Branch 信号传给 CTRL 和 IFU，CTRL 中给 GPR 写使能赋值时增加 `(~overflow && es)`，IFU 中正常对是否 Branch 进行判断。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
