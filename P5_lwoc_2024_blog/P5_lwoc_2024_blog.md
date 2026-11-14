# P5_lwoc_2024_blog

> 项目：P5 ｜ 指令：lwoc ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[kie-chi](https://kie-chi.com/2024/11/14/CO_P5/)、[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

T3 lwoc

I型指令

lwoc rt, offset(base)

```
adder <- GPR[base] + sign_ext(offset || 00)
vadder <- adder[31: 2]
temp1 <- Mem[vadder]
temp2 <- temp1[3: 0]
if temp1 < 0x80000000:
    GPR[temp2] <- temp1
else:
    GPR[rt] <- temp1
```

## 说明

- 出处：《北航计算机组成P5》一文的「课上」小节，「T3 lwoc」。
- 考试形式：加指令（5 级流水线 CPU），文中标注为 `I型指令`。
- 年份：2024 年秋季学期（2023 级）P5 上机。
- 编码：博客**未给出 opcode 编码**（博客未给出）。
- 从伪代码可见该题的特点：正常 lw 把数据写回 `$rt`，但当读出的字（按无符号解释）小于 `0x80000000` 时，写回的目标寄存器号取该字的低 4 位（`temp2`）——**写入的寄存器号由数据决定**，写回地址要到 M 级才能确定，与转发/阻塞强耦合（博客的调试记录也印证了这一点）。

## 出处

- 来源博客：kie-chi（真题）、jiangshiyi（真题）
- 原始链接：https://kie-chi.com/2024/11/14/CO_P5/、https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/
- 类型：真题；整理自博客原文，未经课程组核对。
