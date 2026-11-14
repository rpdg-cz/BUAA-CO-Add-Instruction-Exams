# P5_lrm_2020_blog

> 项目：P5 ｜ 指令：lrm ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第三题：lrm

$$
\begin{aligned}
& vAddr \leftarrow GPR[base] + \operatorname{sign\_extend}(offset) \\
& mem\_reg \leftarrow Memory[vAddr]_{4..0} \\
& GPR[mem\_reg] \leftarrow GPR[rt]
\end{aligned}
$$

## 说明

- 考试形式：P5 上机（Verilog 流水线 CPU 加指令），本次三道题中的第三题（访存 + 条件存储类）。
- 场次：出自该博主 **P5 第二次上机（"上机总结 2"）**。
- 年份：2020（文章发布 2020-11-23）。
- 博客未给出 opcode 编码与测试点。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p5/
- 类型：真题；整理自博客原文，未经课程组核对。
