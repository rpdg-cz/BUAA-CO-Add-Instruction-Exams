# P4_eam_2024_blog — 题解

> 项目：P4 ｜ 指令：eam ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)、[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)

## 题解

- 按"尽早产生数据"原则在 **D 级组合逻辑**内算出回写结果：

```verilog
wire [15:0] eam_low16 = A1_DEin[15:0];
wire [15:0] eam_ans16 = (($signed(eam_low16) % $signed(16'd17)) + $signed(16'd17)) % $signed(16'd17);
wire [31:0] eam_ans32 = (A2_DEin[31] == 1) ? {16'b0, eam_ans16} : {16'b1, eam_ans16};
assign WriteBack_DEin = (isEam_DEin == 1) ? eam_ans32 : ...;
```

- 控制信号：`RegWrite = 1`，`RegDst = 2'b01`（写 `rd`）。
- 冒险：`Tuse_RS = 0`、`Tuse_RT = 0`（D 级即用 rs/rt），`Tnew_DEin = 1`（D 级出新数据）。
- 必须同步修改 E/M 级的 `WriteBack`，否则上游算对的数据会在下游被覆盖：

```verilog
assign WriteBack_EMin = (isEam_DEout === 1) ? WriteBack_DEout : ...;
assign WriteBack_MWin = (MemtoReg_EMout == 1) ? WD : WriteBack_EMout;
```

- 由于回写地址确定（`rd`），无需额外担心转发正确性。

### 补充题解（来自 kie-chi）

原文「总结」小节对本场的提示（逐字摘录）：

> 课上没什么好玩的，第一个指令注意要使用有符号，不然你就会像我一样疑惑了半个小时为什么这么取模都是0然后暴力while循环求余数。。。

即：`GPR[rs][15:0]` 要按**有符号**数解释后再对 17 取模，博客强调这是他当时卡住（取模结果一直是 0）的原因。博客未给出该题的完整实现代码。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
