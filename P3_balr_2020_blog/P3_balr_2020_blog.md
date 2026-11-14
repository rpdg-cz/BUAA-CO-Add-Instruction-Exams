# P3_balr_2020_blog

> 项目：P3 ｜ 指令：balr ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第一题：balr
>
> 这是一个类似于 jalr 的指令。

$$
\begin{aligned}
& PC \leftarrow PC + 4 + \mathtt{sign\_ext}(imm||0^2) \\
& GPR[rt] \leftarrow PC + 4
\end{aligned}
$$

## 说明

- 考试形式：P3 上机（Logisim 单周期 CPU 加指令）。本次三道题为"跳转 + 计算 + 访存"，本文件记录第一题（跳转类）。
- 年份：2020（文章发布 2020-11-15；博主 2020 级，CO 2020 年秋）。
- 博客只给出 RTL，未给出 opcode/funct 编码与测试点。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p3/
- 类型：真题；整理自博客原文，未经课程组核对。
