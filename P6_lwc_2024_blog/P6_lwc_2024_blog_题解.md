# P6_lwc_2024_blog — 题解

> 项目：P6 ｜ 指令：lwc ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 默认写 `rt`：`assign RegDst = (lwc || ...) ? 2'b00 : ...;`
- 奇偶要到 M 级读出 `WD` 才知道，因此要针对"可能写到 31 号寄存器"做定向阻塞（与 `lwoc` 同型）：

```verilog
assign stall_E = (isLwc_E == 1 && (rs_D == 31 || rt_D == 31)) ? 1 : 0;
assign stall_M = (isLwc_M == 1 && RegAddr_M == 31 && (rs_D == 31 || rt_D == 31)) ? 1 : 0;
```

- 博客代码原文写作 `&s&`（应为 `&&`），此处照录并说明。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
