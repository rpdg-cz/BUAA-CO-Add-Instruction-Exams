# P5_lrm_2020_blog — 题解

> 项目：P5 ｜ 指令：lrm ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

## 题解

> 存储地址为 DM 输出的低位。

即写入地址取自 DM 读出值的低 5 位（`Memory[vAddr]_{4..0}` 作为 GRF 写地址），属于"写入目标完全取决于 DM 读取值"的条件存储类型。该博主在"上机总结 3 & 分析"中给出的 stall 写法：

```verilog
// lrm
wire stall_rs_e = (TuseRS < TnewE) && D_rs_addr && (D_lrm ? D_rs_addr : D_rs_addr == E_RFDst);
```

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
