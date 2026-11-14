# P5_blezalc_2020_blog — 题解

> 项目：P5 ｜ 指令：blezalc ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

在比较模块按有符号数判非正，把条件随指令传递并用于最终写31的使能。分支地址与链接值均使用该指令的 PC，不能使用当时取指级的 PC。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
