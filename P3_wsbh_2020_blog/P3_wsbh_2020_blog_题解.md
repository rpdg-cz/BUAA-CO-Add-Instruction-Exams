# P3_wsbh_2020_blog — 题解

> 项目：P3 ｜ 指令：wsbh ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

在计算单元中增加固定字节排列，将结果接入原写回通路，目的寄存器选 `rd`。不需要可变移位量。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
