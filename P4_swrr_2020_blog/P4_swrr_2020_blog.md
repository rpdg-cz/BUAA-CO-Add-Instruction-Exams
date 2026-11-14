# P4_swrr_2020_blog

> 项目：P4 ｜ 指令：swrr ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p4/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第三题：swrr
>
> 向右循环位移，有点类似 sw。注意好好看题！题目要求 `$display()` 要字对齐。

$$
\begin{aligned}
& Addr \leftarrow GPR[base] + \mathtt{sign\_ext}(offset) \\
& temp \leftarrow Addr_{1..0} \\
& \operatorname{if}\ temp == 0\ \operatorname{then} \\
& \qquad mem_{addr} \leftarrow GRF[rt] \\
& \operatorname{else} \\
& \qquad mem_{addr} \leftarrow GRF[rt]_{8*temp - 1 \cdots 0}||GRF[rt]_{31 \cdots 8*temp}
\end{aligned}
$$

## 说明

- 考试形式：P4 上机（Verilog 单周期 CPU 加指令），本次三道题中的第三题（访存类）。
- 年份：2020（文章发布 2020-11-19）。
- 博客未给出 opcode 编码与测试点；注意题面额外要求 `$display()` 输出字对齐。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p4/
- 类型：真题；整理自博客原文，未经课程组核对。
