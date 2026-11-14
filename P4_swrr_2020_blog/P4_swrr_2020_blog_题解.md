# P4_swrr_2020_blog — 题解

> 项目：P4 ｜ 指令：swrr ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p4/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

地址低两位控制四选一字节排列器，然后复用存字路径。注意输出的内存地址需要清除低两位，记录的数据必须是旋转后的值。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p4/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
