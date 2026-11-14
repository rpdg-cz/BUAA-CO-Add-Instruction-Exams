# P3_lbi_2020_blog

> 项目：P3 ｜ 指令：lbi ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第三题：lbi
>
> 一个很像 lb 的指令，唯一的区别在于需要用到存储器，需要稍微修改一下数据通路。

$$
\begin{aligned}
& Addr \leftarrow GPR[base] + \mathtt{sign\_ext}(offset) \\
& mem \leftarrow memory[Addr] \\
& byte \leftarrow Addr_{1..0} \\
& GPR[rt]_{7+8*byte..8*byte} \leftarrow mem_{7+8*byte..8*byte}
\end{aligned}
$$

## 说明

- 考试形式：P3 上机（Logisim 单周期 CPU 加指令），本次三道题中的第三题（访存类）。
- 年份：2020（文章发布 2020-11-15）。
- 博客未给出 opcode 编码与测试点；RTL 中 `GPR[base]` 即 rs 域。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p3/
- 类型：真题；整理自博客原文，未经课程组核对。
