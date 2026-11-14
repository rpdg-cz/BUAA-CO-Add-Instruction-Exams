# P7_lww_2024_blog

> 项目：P7 ｜ 指令：lww ｜ 年份：2024（博客发表年） ｜ 类型：博主自拟设想（非考题记录） ｜ 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)
>
> 本条是博主在 withdraw 题解后自行提出的变体，不是 2024 年考题或考试回忆。本仓库只保留为带出处的残缺参考资料，不将其冒充往届试题；其关键行为也尚不能唯一还原。

## 题目：比较撤销记录数据后的条件加载

## 编码与汇编格式

博客未记录可验证的opcode/funct及完整位域编码；本文不分配编码。

`lww rt, offset(base)`（来源记录）。

## 描述

按给出的地址公式加载32位字W，并读取CP0.ChangeData为C。W>C时执行withdraw的撤销行为；W<C时将W写rt；W=C时将C写入`C[4:0] XOR rt`号寄存器。这里rt在异或中是5位寄存器编号，不是GPR[rt]数据。

## 操作

`GPR`为32个32位通用寄存器，0号读恒为零、写入无效。`U32`/`S32`分别表示同一32位位串的无符号/补码有符号解释；`mod 2^32`只保留低32位。位号从最低位0开始。RTL右侧均读取本指令写回前的源状态；未列出的体系结构状态保持不变。

```text
EA ← ADDRESS_ADD(GPR[base], offset)
W ← Mem32[EA AND 0xfffffffc]
C ← CP0.ChangeData
if GREATER(W,C):
    execute WITHDRAW_SEMANTICS
else if LESS(W,C):
    GPR[rt] ← W
else:
    D ← C[4:0] XOR rt
    GPR[D] ← C
```

## 边界与异常

相等分支D为0..31，D=0时忽略寄存器写回。W>C的分支没有描述普通加载回写。原文用addr[31:2]索引字存储器，只能确认字选择方式，不能据此断言P7允许未对齐load。

## 课程语义

按P7 CP0规范（本地课程教程：`P7/implement/P7-2-3.md`）及精确异常规则（本地课程教程：`P7/implement/P7-2-4.md`），异常/中断请求获准提交时统一进入0x4180，受害指令及年轻指令不得留下GPR、HI/LO、内存或外设副作用，较老指令正常完成。记录受害PC及BD；受害指令在延迟槽时EPC为其PC−4且BD=1，否则EPC为其PC且BD=0。普通分支/跳转保留延迟槽，eret无延迟槽。新CP0寄存器的读写亦须保持程序顺序；本题特例与优先级缺项另行说明。

## 出处与资料缺项

- 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)。
- 大小比较未标有符号性；offset位宽/扩展、未对齐及地址溢出的具体处理未记述。W>C继承withdraw未还原的上界及连续撤销问题。不能据标准lw自动覆盖该变体地址处理。
- 依赖[withdraw题面](../P7_withdraw_2024_blog/P7_withdraw_2024_blog.md)；来源addr[31:2]是字索引表达式，不是把内存系统改成按字节地址除4后访问其他地址。
