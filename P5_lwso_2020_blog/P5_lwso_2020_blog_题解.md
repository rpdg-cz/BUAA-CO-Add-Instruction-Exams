# P5_lwso_2020_blog — 题解

> 项目：P5 ｜ 指令：lwso ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

## 题解

> 实际上就是：如果第二步相加没有溢出就赋值，否则不赋值。

该博主在"上机总结 3 & 分析"里以 lwso 为例讲了条件存储的 stall 与写地址修正：

```verilog
//lwso
wire stall_rs_e = (TuseRS < TnewE) && D_rs_addr && (D_lwso ? D_rs_addr == 5'd31 : D_rs_addr == E_RFDst);
```

```verilog
//lwso
M_check = D_lwso && condition;
// CU
assign RFDst = // ...
  lwso ? (check === 1'd1 ? 5'd31 : 5'd0) : // 注意不是直接一个 check
  5'd0;
```

要点：条件存储要到 M 级才知道写哪个寄存器，因此 D 级读该寄存器、而新指令**可能**写它时就要 stall；统一 CU 写法下 `check` 在 E 级为 `x`，故用 `check === 1'd1` 排除不定态。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
