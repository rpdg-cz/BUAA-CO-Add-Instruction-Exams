# P5_跳转并链接比较_blog — 题解

> 项目：P5 ｜ 年份：未标注 ｜ 来源：[lsyycf](https://lsyycf.github.io/P5P6%E4%B8%8A%E6%9C%BA/)

## 题解

**条件跳转类指令：修改 D 段的比较方法，添加 FD 级寄存器的清空操作。**

- 控制信号：修改比较模块的比较方法选择信号；修改跳转方法选择信号；设置 Tuse，D 段需要立即用到 rs 和 rt 的读出结果进行判断，D 段两个 Tuse 均设置为 0；设置 Tnew，由于需要将 D 段的 PC+8 被写入寄存器，E、M、W 段的 Tnew 设置为 0；改为有符号的立即数拓展；其余与 jal 相同。
- 顶层模块：在比较模块中添加一种用于新指令的计算方法；新增一种用于新指令的跳转方法；如果需要清空延迟槽，在满足该指令的清空条件，且不处于阻塞态时，复位 FD 级寄存器。

原文给出的完整改动（针对本题）：

```verilog
// 1.D_CU.v 修改比较模块的比较方法选择信号
assign cmpOp = new ? `cmpOp_new;
// 2.D_CU.v 修改跳转方法选择信号
assign pcOp = new ? `pcOp_new;
// 3.D_CU.v 设置Tuse为0
assign rsTuse = new ? 2'b00;
assign rtTuse = new ? 2'b00;
// 4.E_CU.v M_CU.v W_CU.v 设置Tnew为0
assign Tnew = 2'b00;
// 5.mips.v 改为有符号的立即数拓展
assign extOp = new ? `signed_extend;
// 6.D_Cmp.v 在比较模块中添加一种用于新指令的计算方法
.cmpIn1((D_instr == new) ? D_pc + (D_extend_offset << 2) : D_rsData),
.cmpIn2((D_instr == new) ? D_rsData + D_rtData : D_rtData),
assign cmpRes = (cmpOp == `cmpOp_new) : (cmpIn1 < cmpIn2);
// 7.mips.v 新增一种用于新指令的跳转方法
assign F_nextPc = (pcOp == `pcOp_new) ?
    (D_cmpRes ? (D_pc + (D_extend_offset << 2) + 4) : (D_rsData + D_rtData));
// 8.mips.v 在满足该指令的清空条件，且不处于阻塞态时，复位FD级寄存器
.reset(reset || (D_instr == new && !D_cmpRes && !stall)),
```


> 原文代码块被网页提取拆成一行一个 token；此处按 token 顺序拼接并缩进，未改动内容。个别三元运算符位置在原文中显示为 `:`，疑似原文笔误，未作修正。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
