# P3_lbi_2020_blog — 题解

> 项目：P3 ｜ 指令：lbi ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

写回结果需要同时使用旧 `rt` 与读出字：先清除旧 `rt` 的目标字节，再合入同位置的内存字节。保留旧 `rt` 的读取路径是本题区别于普通 `lb` 的关键。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
