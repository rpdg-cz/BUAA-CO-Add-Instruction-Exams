# P6_lwm_2024_blog — 题解

> 项目：P6 ｜ 指令：lwm ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 控制信号：`RegWrite=1`、`MemRead=1`、`MemtoReg=1`、`word_DEin=1`、`EXTOp=2'b01`。
- 冒险："写回地址在 M 级由 `WD - GRF[rt]` 决定"，博客给 `Tuse_RS=1`、`Tuse_RT=2`、`Tnew_DEin=3`，并做 E/M 级定向阻塞：

```verilog
// E级
stall_E = (isLwm_DEout === 1) ? 1 : 0;
// M级
stall_M = (isLwm_EMout === 1 && RegAddr_MWin !== 5'b0
           && (RegAddr_MWin === rs_DEin || RegAddr_WMin === rt_DEin)) ? 1 : 0;

wire [31:0] lwm_sub = WD - A2_MWin;
RegAddr_MWin = (isLwm_EMout === 1) ? lwm_sub[4:0] : RegAddr_EMout;
```

- 注意 `RegAddr_MWin === 5'b0` 的排除：若算出的地址是 0 号寄存器，不写/不必阻塞。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
