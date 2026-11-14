# P4_cptl_2024_blog — 题解

> 项目：P4 ｜ 指令：cptl ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)、[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)

## 题解

- 属"条件跳转 + 条件写回（写回地址不确定）"：`Branch` 恒为 1（必然跳转），`RegDst` 置 `2'b10` 默认写 31 号寄存器，是否改写成 `rt` 由"低 18 位中是否有连续 6 个 1"决定。
- 在 D 级组合逻辑判 `check`，并在 D 级直接给出 `WriteBack`/`RegAddr`，故 `Tuse_RS = 0`、`Tuse_RT = maxTuse`、`Tnew_DEin = 1`：

```verilog
assign WriteBack_DEin = (isCptl_DEin == 1) ? pc_FDout + 32'h8 : ...;
assign RegAddr_DEin  = (isCptl_DEin == 1 && yes == 1) ? rt_DEin : ...;  // 否则按 RegDst=2'b10 写31
assign Branch_DEin   = (cptl || ...) ? 1 : 0;
assign Zero_DEin     = (cptl || ...) ? 1 : 0;   // 总是会跳转
```

- E/M 级需透传 `WriteBack` 与 `RegAddr`（`isCptl` 随流水线打拍），防止被覆盖；D 级已确定写回地址，故转发天然正确。

### 补充题解（来自 kie-chi）

博客未给出该题的题解（原文在 P4 文末写「先不写题解了，亲爱的小羊找我看视频，我先溜了」），只在题面后留了一句说明：

> 跳转类指令，然后链接内容和rs寄存器低18位是否有6个连续的1有关系

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
