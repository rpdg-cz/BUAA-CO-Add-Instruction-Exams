# P6_lwm_2024_blog

> 项目：P6 ｜ 指令：lwm ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

```verilog
wire lwm = (opcode_DEin == 6'b111110) ? 1 : 0;
```

即 I 型指令，`opcode = 6'b111110`，`offset` 符号扩展（`EXTOp = 2'b01`），按 `lw` 读一个 word。

## 格式

博客未给出。

## 描述

> **lwm 指令**：
> 按照 `lw` 的方式从内存中读出的数记作 WD，把 WD 写入 `WD - GRF[rt]` 号寄存器。

## 说明

- 来源文章《BUAA-CO-P6习题分析》第七节（末节）。博客未说明年份/轮次，未给测试用例。

## 出处

- 来源博客：jiangshiyi（真题）
- 原始链接：https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/
- 类型：真题；整理自博客原文，未经课程组核对。
