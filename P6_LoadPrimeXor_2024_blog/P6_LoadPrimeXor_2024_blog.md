# P6_LoadPrimeXor_2024_blog

> 项目：P6 ｜ 指令：LoadPrimeXor ｜ 年份：2024 ｜ 类型：回忆版 ｜ 来源：[owpeter](https://owpeter.github.io/2024/12/02/CO/CO-p6-course/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> **Load Prime Xor**
> `op | rs | rt | offset`
>
> 其中 `s_prime` 表示"小于等于 x 的最大质数"

位域（博客原文）：

```text
Load Prime Xor
op
rs
rt
offset
```

## 说明

- 来源文章《BUAA-CO-p6-课上》（2024-12-02），**2024 年 P6 上机第 3 题**（加指令题；题号按博客出现顺序推定）。
- 博客只给指令名、位域和 `s_prime` 的定义，**完整语义没有抄**（从名字看是 load 出的值异或后取最大质数作为写回地址），故标 `回忆版`。
- 交叉线索（供核对，不代表同一题）：同年 jiangshiyi 的《BUAA-CO-P6习题分析》里有一道 `lwz`："和 lw 一样读出 WD，把它的低 5 位与 GRF[rt] 的低 5 位异或得 X，找到小于等于 X 的最大质数 Y，把 WD 写入 GRF[Y]"——与本条的 `s_prime` 定义一致。博客未明说，仅供参考。
- 博客未给测试用例。

## 出处

- 来源博客：owpeter（回忆版）
- 原始链接：https://owpeter.github.io/2024/12/02/CO/CO-p6-course/
- 类型：回忆版；整理自博客原文，未经课程组核对。
