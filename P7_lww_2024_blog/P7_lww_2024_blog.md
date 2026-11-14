# P7_lww_2024_blog

> 项目：P7 ｜ 指令：lww ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

原文「课上测试」小节（逐字摘录）：

> 变异load指令

lww $rt, offset($base)

```
addr <- GPR[base] + offset
vaddr <- addr[31: 2]
temp1 <- Mem[vaddr]
temp2 <- CP0.ChangeData
temp3 <- temp2[4: 0]
if temp1 > CP0.ChangeData:
    withdraw                <- 这个withdraw是原题的withdraw
elif temp1 < CP0.ChangeData:
    GPR[rt] <- temp1
else:
    GPR[temp3 ^ rt] <- temp2
```

其中「这个withdraw是原题的withdraw」为博客原文夹注，指上一题的 `withdraw` 指令（见同目录 [P7 withdraw](../P7_withdraw_2024_blog/P7_withdraw_2024_blog.md)）。

## 说明

- 出处：《北航计组组成P7》一文的「课上测试」小节，紧接 `withdraw` 题之后。
- 考试形式：加指令（P7 异常/中断 CPU 上增加一条 load 变体），需要读写 CP0 中的 `ChangeData`，并与 `withdraw` 题的行为耦合。
- 年份：2024 年秋季学期（2023 级）P7 上机。
- 编码：博客**未给出 opcode 编码**（博客未给出）。
- 三种分支：读出值大于 `ChangeData` → 触发 `withdraw`（即撤销最近一次 sw）；小于 → 普通写回 `$rt`；相等 → 写回到 `ChangeData[4:0] ^ rt` 号寄存器。

## 出处

- 来源博客：kie-chi（真题）
- 原始链接：https://kie-chi.com/2024/12/08/CO_P7/
- 类型：真题；整理自博客原文，未经课程组核对。
