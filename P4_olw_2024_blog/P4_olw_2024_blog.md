# P4_olw_2024_blog

> 项目：P4 ｜ 指令：olw ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

T3 olw

olw $rt, offset($base)

I型指令

```
vadder <- GPR[base] + sign_ext(offset || 00)
temp <- Mem[vadder[31: 2]]
if func(temp):
    GPR[rt] <- temp
else:
    None
```

博客对题面的复述（原文）：

> 如果读出来的数据是单调不减的，那么才写入

## 说明

- 出处：《北航计算机组成P4》一文的「课上」小节，「T3 olw」。
- 考试形式：加指令（在单周期 CPU 上增加指令），文中标注为 `I型指令`。
- 年份：2024 年秋季学期（2023 级）P4 上机。
- 编码：博客**未给出 opcode 编码**（博客未给出）。
- 题面中的 `func(temp)` 是博客原文的写法，对应其下方那句「如果读出来的数据是单调不减的」——即对读出的字做单调性判定，满足才写回 `$rt`，否则不写。
- 另见同目录 [P4 eam](../P4_eam_2024_blog/P4_eam_2024_blog.md)、[P4 cptl](../P4_cptl_2024_blog/P4_cptl_2024_blog.md)。

## 出处

- 来源博客：kie-chi（真题）
- 原始链接：https://kie-chi.com/2024/11/13/CO_P4/
- 类型：真题；整理自博客原文，未经课程组核对。
