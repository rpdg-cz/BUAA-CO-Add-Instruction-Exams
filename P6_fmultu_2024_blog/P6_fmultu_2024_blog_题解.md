# P6_fmultu_2024_blog — 题解

> 项目：P6 ｜ 指令：fmultu ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 乘除槽 3 周期：`assign start_DEin = (fmultu) ? 1 : 0;`，在 `posedge clk` 里 `pause <= 3`（`isFmultu_DEout == 1` 时重新装载）。
- 组合逻辑算 `prod`、`highbit_1`、`lowbit_0`、`reverse_bit` 并翻转，最后写 `hi_hold` / `lo_hold`：

```verilog
reg [63:0] prod;  reg [5:0] highbit_1, lowbit_0, reverse_bit;
for (i = 63; i >= 0; i = i - 1) if (prod[i] == 1) begin highbit_1 = i; break; end
for (i = 0;  i < 64;  i = i + 1) if (prod[i] == 0) begin lowbit_0  = i; break; end
reverse_bit = (highbit_1 - lowbit_0 > 0) ? highbit_1 - lowbit_0 : lowbit_0 - highbit_1;
prod[reverse_bit] = !prod[reverse_bit];
hi_hold = prod[63:32];  lo_hold = prod[31:0];
```

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
