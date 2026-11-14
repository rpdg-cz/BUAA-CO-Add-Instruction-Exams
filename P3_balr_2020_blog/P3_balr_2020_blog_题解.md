# P3_balr_2020_blog — 题解

> 项目：P3 ｜ 指令：balr ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

可复用相对分支的目标地址计算，并增加无条件 PC 选择与写 `rt` 的链接路径。博客将其类比 `jalr`，这只是数据通路分析提示；目标地址实际由立即数产生，不是从源寄存器取出。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
