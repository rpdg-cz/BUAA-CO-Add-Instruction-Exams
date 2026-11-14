# P6_lwz_2024_blog — 题解

> 项目：P6 ｜ 指令：lwz ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 属"条件 Load：写回地址不确定"，写回地址在 M 级才能由 `WD` 算出，需要对可能的寄存器（质数表）做定向阻塞：

```verilog
// E级
wire stall_E = (isLwz_DEout == 1 && (rs_DEin == 质数 || rt_DEin == 质数)) ? 1 : 0;
// M级
wire stall_M = (isLwz_EMout == 1 && (RegAddr_MWin == rs_DEin || RegAddr_MWin == rt_DEin)) ? 1 : 0;
```

- "小于等于 X 的最大质数"用打表/级联比较实现（博客给了 `31/29/23/19/17/13/11/7/5/3/2/1` 的降序比较链）：

```verilog
wire [4:0] xor_ans = WD[4:0] ^ A2[4:0];
wire [4:0] max_z = (xor_ans >= 31) ? 31 : (xor_ans >= 29) ? 29 : ... : 1;
assign RegAddr_MWin = (isLwz_EMout == 1) ? max_z : ...;
```

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
