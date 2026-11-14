# P4_bsoal_2020_blog

> 项目：P4 ｜ 指令：bsoal ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p4/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第一题：bsoal
>
> 感觉这个指令是全场最难（溜）。需要熟悉组合电路的 `always @(*)` 写法，或者直接用 `function`。
>
> 当寄存器值有奇数个 \(1\) 的时候跳转。

$$
\begin{aligned}
& \operatorname{if}\ \operatorname{has\_odd\_one\_bits}(GRF[rs])\ \operatorname{then} \\
& \qquad PC = PC + 4 + \operatorname{sign\_ext}(offset || 0^2) \\
& \qquad GRF[31] = PC + 4 \\
& \operatorname{else} \\
& \qquad PC = PC + 4
\end{aligned}
$$

## 说明

- 考试形式：P4 上机（Verilog 单周期 CPU 加指令）。本次三道题，本文件记录第一题。
- 年份：2020（文章发布 2020-11-19；博主 2020 级，CO 2020 年秋）。
- 博客未给出 opcode 编码与测试点。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p4/
- 类型：真题；整理自博客原文，未经课程组核对。
