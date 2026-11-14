# P5_cmco_2020_blog — 题解

> 项目：P5 ｜ 指令：cmco ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

组合循环维护当前连续段长与历史最大值，遇到 0 才把当前段长清零。两个计数都须能表示 32。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
