# P5_cco_2020_blog — 题解

> 项目：P5 ｜ 指令：cco ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

先计算两源的按位与，再对结果做 32 位一位计数。计数器需能表示 32，不能只用 5 位；ALU结果作为完整 32 位值写回。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
