# P5_jtl_2024_blog

> 项目：P5 ｜ 指令：jtl ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[kie-chi](https://kie-chi.com/2024/11/14/CO_P5/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

T2 jtl

I型指令

jtl rs, rt, label

```
temp1 <- GPR[rs] + GPR[rt]
temp2 <- PC + 4 + sign_ext(offset || 00)
if temp1 > temp2:
    PC <- temp2
else:
    PC <- temp1
Nullifycation()
```

## 说明

- 出处：《北航计算机组成P5》一文的「课上」小节，「T2 jtl」。
- 考试形式：加指令（5 级流水线 CPU），文中标注为 `I型指令`。
- 年份：2024 年秋季学期（2023 级）P5 上机。
- 编码：博客**未给出 opcode 编码**（博客未给出）。
- 题面要求与延迟槽/分支延迟相关：伪代码末尾的 `Nullifycation()` 是博客原文写法，即该指令需要按跳转类指令处理延迟槽（博客未展开说明具体要作废几条指令）。

## 出处

- 来源博客：kie-chi（真题）
- 原始链接：https://kie-chi.com/2024/11/14/CO_P5/
- 类型：真题；整理自博客原文，未经课程组核对。
