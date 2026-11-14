# P4_cptl_2024_blog — 题解

> 项目：P4 ｜ 指令：cptl ｜ 年份：2024（博客发布年；场次见出处） ｜ 类型：博客整理 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)、[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)

本文是实现分析，与题面分开；来源中的做法不代表唯一实现。 本题目前为残题，以下提示不能代替缺失的规格。

## 实现分析

在补齐链接值前只能确定检测逻辑、目的寄存器选择与分支目标。比较应覆盖13个长度为6的窗口，任一窗口全1即可。jiangshiyi给的PC+8流水线做法属于该来源版本，不能当作无争议题意。

## 资料说明

[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)、[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)

实现中的信号名、流水级分配与 Tuse/Tnew 数值取决于具体数据通路，应根据实际使用和产生数据的时刻重新计算。
