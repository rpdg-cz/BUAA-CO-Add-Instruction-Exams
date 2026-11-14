# P7_CP0内存限制异常_2024_blog

> 项目：P7 ｜ 指令：CP0内存权限扩展（非新增指令） ｜ 年份：2024 ｜ 类型：博客整理 ｜ 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)
>
> 本文将博客记录改写为课程题面式表达，不是课程组官方原题。状态：行为已正规化；编码缺失不影响语义阅读。

## 题目：由CP0配置内存区间读写限制

## 编码与汇编格式

博客未记录可验证的opcode/funct及完整位域编码；本文不分配编码。

本题是CP0及异常机制扩展，不新增名为memory的指令。沿用`mtc0 rt, rd`、`mfc0 rt, rd`配置和读取新增CP0寄存器。

## 描述

在CP0新增32位18号LowerLimit和19号UpperLimit，均支持完整32位mfc0/mtc0访问。两寄存器低16位零扩展后构成半开限制区间[L,U)。两寄存器高16位中1的总数为奇数时，该区间只读；为偶数时只写。一次访存的任一字节落入限制区间，即视为访问该区间。

## 操作

`GPR`为32个32位通用寄存器，0号读恒为零、写入无效。`U32`/`S32`分别表示同一32位位串的无符号/补码有符号解释；`mod 2^32`只保留低32位。位号从最低位0开始。RTL右侧均读取本指令写回前的源状态；未列出的体系结构状态保持不变。

```text
L ← ZeroExtend16To32(CP0.LowerLimit[15:0])
U ← ZeroExtend16To32(CP0.UpperLimit[15:0])
odd ← ((popcount(CP0.LowerLimit[31:16]) + popcount(CP0.UpperLimit[31:16])) mod 2 = 1)
A ← 本条访存的有效字节地址
n ← 1 for lb/sb, 2 for lh/sh, 4 for lw/sw
hit ← (L < U) AND EXISTS i ∈ [0,n-1]: L ≤ A+i < U
if hit AND odd AND isStore:
    SignalException(AdES, ExcCode=5)
else if hit AND NOT odd AND isLoad:
    SignalException(AdEL, ExcCode=4)
else:
    按原课程访存规则继续
```

## 边界与异常

来源保证0≤L≤U≤0x3000，且L=U时没有限制。上界不包含在区间内；不能只比较有效地址起点，必须考虑整个字节覆盖范围。该限制只增加拒绝条件，不使原本越界、未对齐、地址加法溢出或设备非法的访问变合法。

## 课程语义

按P7 CP0规范（本地课程教程：`P7/implement/P7-2-3.md`）及精确异常规则（本地课程教程：`P7/implement/P7-2-4.md`），异常/中断请求获准提交时统一进入0x4180，受害指令及年轻指令不得留下GPR、HI/LO、内存或外设副作用，较老指令正常完成。记录受害PC及BD；受害指令在延迟槽时EPC为其PC−4且BD=1，否则EPC为其PC且BD=0。普通分支/跳转保留延迟槽，eret无延迟槽。新CP0寄存器的读写亦须保持程序顺序；本题特例与优先级缺项另行说明。

## 出处与资料缺项

- 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)。
- 未记录完整官方题面、官方测试与评测周期门限。若编码或汇编书写格式缺失，使用前须另行指定编码；这不等于指令行为残缺。
- 来源题解明确“操作范围与限制区间存在交集即触发”，据此将正文中内存操作正规化为按字节覆盖的区间判断。原文没有规定新增寄存器复位值及同条指令多种AdEL/AdES来源的内部先后；同码来源不改变可见ExcCode。
