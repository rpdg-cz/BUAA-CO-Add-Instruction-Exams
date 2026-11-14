# P7_tltiu_2021_blog

> 项目：P7 ｜ 指令：tltiu ｜ 年份：2021 ｜ 类型：博客整理 ｜ 来源：[master-Tan](https://master-tan.github.io/2021/12/16/CO%20-%20P7/)、[Thysrael](https://thysrael.github.io/posts/4c542040/)
>
> 本文将博客记录改写为课程题面式表达，不是课程组官方原题。状态：行为已正规化；编码缺失不影响语义阅读。

## 题目：无符号小于符号扩展立即数时陷入

## 编码与汇编格式

博客表格把REGIMM操作码写为`000000`，同时rt固定为`01011`。该opcode与REGIMM名称冲突：标准tltiu以及本地MARS的InstructionSet.java中为`000001 rs 01011 immediate`。这里将`000000`保留为来源疑误，不将其当作可直接汇编的原题编码；实际复现应先核定所用编码。

`tltiu rs, immediate`（来源记录），immediate为16位字段。

## 描述

先将16位立即数符号扩展到32位，再把源寄存器和扩展结果均解释为无符号32位整数比较。源值较小时产生Trap异常，ExcCode=13；否则继续执行，不写GPR、HI/LO或数据存储器。

## 操作

`GPR`为32个32位通用寄存器，0号读恒为零、写入无效。`U32`/`S32`分别表示同一32位位串的无符号/补码有符号解释；`mod 2^32`只保留低32位。位号从最低位0开始。RTL右侧均读取本指令写回前的源状态；未列出的体系结构状态保持不变。

```text
A ← U32(GPR[rs])
I ← U32(SignExtend16To32(immediate))
if A < I:
    SignalException(Trap, ExcCode=13)
else:
    continue sequential execution
```

## 边界与异常

“unsigned”修饰比较，不表示立即数零扩展。例如immediate=0xffff时I=0xffffffff，除rs全一外均满足条件；immediate=0时没有无符号源值更小。

## 课程语义

按P7 CP0规范（本地课程教程：`P7/implement/P7-2-3.md`）及精确异常规则（本地课程教程：`P7/implement/P7-2-4.md`），异常/中断请求获准提交时统一进入0x4180，受害指令及年轻指令不得留下GPR、HI/LO、内存或外设副作用，较老指令正常完成。记录受害PC及BD；受害指令在延迟槽时EPC为其PC−4且BD=1，否则EPC为其PC且BD=0。普通分支/跳转保留延迟槽，eret无延迟槽。新CP0寄存器的读写亦须保持程序顺序；本题特例与优先级缺项另行说明。

## 出处与资料缺项

- 来源：[master-Tan](https://master-tan.github.io/2021/12/16/CO%20-%20P7/)、[Thysrael](https://thysrael.github.io/posts/4c542040/)。
- 未记录完整官方题面、官方测试与评测周期门限。若编码或汇编书写格式缺失，使用前须另行指定编码；这不等于指令行为残缺。
- 操作语义以来源明确给出的“0||sign_extend(immediate)”为准；修正编码疑误不改变该语义。
