# P6_btd_2024_blog — 题解

> 项目：P6 ｜ 指令：btd ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 博客原话："该指令是一条 I 指令，可以将其看作为必然会跳转的 beq，只是在 beq 基础上需要加一段偏移"。
- 控制信号：`Branch = 1`、`EXTOp = 2'b01`（符号扩展）；`zero_DEin` 恒为 1（无条件跳转）。
- 冒险：`Tuse_RS = 1`、`Tuse_RT = 1`（D 级用 rs、rt 算 `d`），`Tnew_DEin = minTnew`（不产生新数据）。
- 偏移量的算法：把 `d` 左移 1 后取 `d[29:0]` 拼 `2'b0`，再加立即数：

```verilog
wire [31:0] d = ((A1_DEin + A2_DEin) & 32'hfffffffe) << 1;
wire [31:0] distance = {d[29:0], 2'b0};
assign shift = (isBtd_DEin == 1) ? (distance + immExt_DEin) : ...;
```

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
