# P6_lhs_2020_blog

> 项目：P6 ｜ 指令：lhs ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p6/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第三题：lhs

$$
\begin{aligned}
& Addr \leftarrow GPR[base] + \operatorname{signed\_ext}(offset) \\
& memword \leftarrow memory[Addr] \\
& byte \leftarrow Addr_{1..0} \\
& \operatorname{if}\ byte = 0\ \operatorname{then} \\
& \qquad GPR[rt] \leftarrow \operatorname{signed\_ext}(memword_{7..0}) \\
& \operatorname{else}\ \operatorname{if}\ byte = 2\ \operatorname{then} \\
& \qquad GPR[rt] \leftarrow \operatorname{signed\_ext}(memword_{23..16})
\end{aligned}
$$

## 说明

- 考试形式：P6 上机（Verilog 流水线 CPU 加指令），本次三道题中的第三题（访存类）。
- 年份：2020（文章发布 2020-12-02）。
- 博客未给出 opcode 编码与测试点；博主自称 RTL"应该是这样的，记不太清了"。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p6/
- 类型：真题；整理自博客原文，未经课程组核对。
