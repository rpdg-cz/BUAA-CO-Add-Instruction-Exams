# P5_bgezall_2020_blog — 题解

> 项目：P5 ｜ 指令：bgezall ｜ 年份：2020 ｜ 类型：博客整理 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

将是否跳转与是否链接分开控制，链接不依赖条件。延迟槽清空必须受分支实际推进和非停顿条件约束，否则分支等待数据时会错误丢弃指令。

## 资料说明

[roife](https://roife.github.io/posts/buaa-co-lab-p5/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
