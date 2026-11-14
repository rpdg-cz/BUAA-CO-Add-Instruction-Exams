# P7_withdraw_2024_blog

> 项目：P7 ｜ 指令：withdraw ｜ 年份：2024 ｜ 类型：博客整理 ｜ 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)、[UHO](https://theuho.site/2024/12/11/COexamP7/)
>
> 本文将博客记录改写为课程题面式表达，不是课程组官方原题。状态：残题：指令行为尚不能唯一还原。

## 题目：撤销最近一次字存储

## 编码与汇编格式

博客未记录可验证的opcode/funct及完整位域编码；本文不分配编码。

`withdraw`为来源记录的指令名；没有可确认的opcode/funct与新增CP0寄存器编号。

## 描述

新增CP0的DomainLo、DomainHi、ChangeAddr、ChangeData。每次sw成功修改内存时，保存其地址及修改前的整字值；withdraw在已有sw历史且地址被允许时，把保存的旧字值写回以撤销该次存储。尚无sw历史时withdraw不产生作用。mfc0可读四个寄存器，mtc0仅可写DomainLo/DomainHi。

## 操作

`GPR`为32个32位通用寄存器，0号读恒为零、写入无效。`U32`/`S32`分别表示同一32位位串的无符号/补码有符号解释；`mod 2^32`只保留低32位。位号从最低位0开始。RTL右侧均读取本指令写回前的源状态；未列出的体系结构状态保持不变。

```text
成功提交sw(A, W)时：
    ChangeAddr ← A
    ChangeData ← 执行该sw之前的Mem32[A]
    Mem32[A] ← W
    hasSW ← true
执行withdraw时：
    if NOT hasSW:
        no effect
    else if NOT IN_ALLOWED_DOMAIN(ChangeAddr, DomainLo, DomainHi):
        SignalException(AdES, ExcCode=5)
    else:
        Mem32[ChangeAddr] ← ChangeData
        HISTORY_AFTER_WITHDRAW ← UNRESOLVED
```

## 边界与异常

来源保证上下界在0x0000..0x3000且字对齐。未成功提交的sw不能留下已完成存储的历史，异常受害指令及年轻指令不能改变内存或撤销记录。withdraw成功时具有一次整字store的内存写效果。

## 课程语义

按P7 CP0规范（本地课程教程：`P7/implement/P7-2-3.md`）及精确异常规则（本地课程教程：`P7/implement/P7-2-4.md`），异常/中断请求获准提交时统一进入0x4180，受害指令及年轻指令不得留下GPR、HI/LO、内存或外设副作用，较老指令正常完成。记录受害PC及BD；受害指令在延迟槽时EPC为其PC−4且BD=1，否则EPC为其PC且BD=0。普通分支/跳转保留延迟槽，eret无延迟槽。新CP0寄存器的读写亦须保持程序顺序；本题特例与优先级缺项另行说明。

## 出处与资料缺项

- 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)、[UHO](https://theuho.site/2024/12/11/COexamP7/)。
- DomainHi上界：正文“超过”指向闭区间，示例代码Addr>=DomainHi指向半开区间，二者冲突。成功撤销后是否清除hasSW、是否把撤销自身当成新sw并更新ChangeData，也未说明，连续withdraw行为无法还原。新增CP0复位值/编号和对非DM sw的记录范围亦未记录。
- withdraw与lww存在语义耦合，见[P7_lww_2024_blog](../P7_lww_2024_blog/P7_lww_2024_blog.md)。不根据作者一句“不需要暂停”取消实际CP0/内存相关检查。
