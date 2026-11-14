# P5_bgezall_2020_blog — 题解

> 项目：P5 ｜ 指令：bgezall ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

## 题解

> 还有一种方法是监测到 `D_b_jump` 时，F 级的指令插入 nop（这个在 P7 很常用）。

```verilog
F_instr = (!D_b_jump && D_bgezall) ? 32'd0 : im[pc[13:2] - 12'hc00];
```

（原文该式被 HTML 分行，此处按语义还原为一行代码，变量名未改动。）

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
