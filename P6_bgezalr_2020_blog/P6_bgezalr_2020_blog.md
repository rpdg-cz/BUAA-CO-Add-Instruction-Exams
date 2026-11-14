# P6_bgezalr_2020_blog

> 项目：P6 ｜ 指令：bgezalr ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p6/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第一题：bgezalr

$$
\begin{aligned}
& condition \leftarrow GPR[rs] \ge 0 \\
& GPR[rd] \leftarrow PC + 8 \\
& \operatorname{if}\ condition\ \operatorname{then} \\
& \qquad PC \leftarrow GPR[rt]
\end{aligned}
$$

## 说明

- 考试形式：P6 上机（Verilog 流水线 CPU 加指令，含乘除槽）。本次三道题为"跳转 + 乘除 + 访存"，本文件记录第一题。
- 年份：2020（文章发布 2020-12-02；博主 2020 级，CO 2020 年秋）。
- 博客未给出 opcode/funct 编码与测试点。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p6/
- 类型：真题；整理自博客原文，未经课程组核对。
