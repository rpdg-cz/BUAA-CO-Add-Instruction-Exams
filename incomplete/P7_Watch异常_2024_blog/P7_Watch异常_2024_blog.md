# P7_Watch异常_2024_blog

> 项目：P7 ｜ 指令：Watch异常机制（非新增指令） ｜ 年份：2024 ｜ 类型：博客整理 ｜ 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)
>
> 本文将博客记录改写为课程题面式表达，不是课程组官方原题。状态：残题：指令行为尚不能唯一还原。

## 题目：指令地址与数据地址监视异常

## 编码与汇编格式

博客未记录可验证的opcode/funct及完整位域编码；本文不分配编码。

本题是CP0和异常机制扩展，不新增watch助记符。新增CP0 18号WatchLo、19号WatchHi；均支持全部32位mfc0/mtc0读写。

## 描述

WatchLo高16位零扩展得到指令监视地址I，低16位零扩展得到数据监视地址D。WatchHi[0]为全局使能，[1]为store使能，[2]为load使能，[3]为PC使能。使能条件满足且本指令PC等于I时产生IMWatch；访存覆盖任意一个字节地址D时产生DMWatch。两者异常码均为23。

## 操作

`GPR`为32个32位通用寄存器，0号读恒为零、写入无效。`U32`/`S32`分别表示同一32位位串的无符号/补码有符号解释；`mod 2^32`只保留低32位。位号从最低位0开始。RTL右侧均读取本指令写回前的源状态；未列出的体系结构状态保持不变。

```text
I ← ZeroExtend16To32(CP0.WatchLo[31:16])
D ← ZeroExtend16To32(CP0.WatchLo[15:0])
E ← CP0.WatchHi
IMWatch ← E[0] AND E[3] AND (PC = I)
A ← 访存有效字节地址
n ← 1 for lb/sb, 2 for lh/sh, 4 for lw/sw
dataHit ← EXISTS i ∈ [0,n-1]: A+i = D
DMWatch ← E[0] AND dataHit AND ((isStore AND E[1]) OR (isLoad AND E[2]))
if SELECTED_WATCH_EXCEPTION:
    SignalException(Watch, ExcCode=23)
```

## 边界与异常

监视地址不要求字或半字对齐，不能只将有效地址与D直接比较。PC地址未对齐/越界的AdEL优先于IMWatch。来源首句又称IMWatch高于其他异常，但后文将其写为低于取数存数AdEL/AdES，见资料缺项。

## 课程语义

按P7 CP0规范（本地课程教程：`P7/implement/P7-2-3.md`）及精确异常规则（本地课程教程：`P7/implement/P7-2-4.md`），异常/中断请求获准提交时统一进入0x4180，受害指令及年轻指令不得留下GPR、HI/LO、内存或外设副作用，较老指令正常完成。记录受害PC及BD；受害指令在延迟槽时EPC为其PC−4且BD=1，否则EPC为其PC且BD=0。普通分支/跳转保留延迟槽，eret无延迟槽。新CP0寄存器的读写亦须保持程序顺序；本题特例与优先级缺项另行说明。

## 出处与资料缺项

- 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)。
- 原文“对于DM异常”之后却写“IMWatch优先级低于取数存数AdEL/AdES”，与前一句IMWatch优先级说明冲突。若后一句实指DMWatch，则可形成一致规则，但未经证据不能把该推测冒充原题。需核定同一指令同时IMWatch和数据地址错误时的优先级。
- 已将原文Watch[1]统一校为WatchHi[1]（上下文唯一对应）；IM/DM异常优先级错误涉及实际行为，保留为待核项，不作无依据修补。
