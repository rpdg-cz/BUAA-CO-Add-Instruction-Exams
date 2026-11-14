# P4_bsoal_2020_blog — 题解

> 项目：P4 ｜ 指令：bsoal ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p4/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

32 位归约异或即可得到 1 的个数的奇偶性，也可使用组合计数。将同一个条件同时用于 PC 选择和链接写使能；不满足条件时不能写 31 号寄存器。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p4/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
