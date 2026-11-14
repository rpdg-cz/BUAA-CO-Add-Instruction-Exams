# P6_btd_2024_blog

> 项目：P6 ｜ 指令：btd ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

```verilog
wire btd = (opcode_DEin == 6'b111110) ? 1 : 0;
```

即 I 型指令，`opcode = 6'b111110`，`offset` 做**符号扩展**（`EXTOp = 2'b01`）。

## 格式

博客未给出。

## 描述

> **btd 指令**：
> `d = （GRF[rt] + GRF[rs]）& 32'hfffffffe`
> `d << 1`
> 无条件跳转到 `pc + 4 + ( d[29:0] || 00 ) + offset`

## 说明

- 来源文章《BUAA-CO-P6习题分析》第二节。博客未说明年份/轮次。
- 原文里"d = （GRF[rt] + GRF[rs]）& 32'hfffffffe"后单独一行"d << 1"，博客的 RTL 实现为 `wire [31:0] d = ((A1_DEin + A2_DEin) & 32'hfffffffe) << 1;`。
- 博客未给测试用例。

## 出处

- 来源博客：jiangshiyi（真题）
- 原始链接：https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/
- 类型：真题；整理自博客原文，未经课程组核对。
