# P5_ae_2024_blog — 题解

> 项目：P5 ｜ 指令：ae ｜ 年份：2024（博客发布年；场次见出处） ｜ 类型：博客整理 ｜ 来源：[owpeter](https://owpeter.github.io/2024/11/18/CO/CO-p5-course/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。

## 实现分析

按位生成结果，或者先用 16 位逻辑异或得到 `upper = imm XOR low16(imm << 1)`，再拼接 `upper||imm`。必须在 16 位内截断移位结果，不能把逐位操作替换成整数求和。

## 资料说明

[owpeter](https://owpeter.github.io/2024/11/18/CO/CO-p5-course/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
