# P4_cptl_2024_blog

> 项目：P4 ｜ 指令：cptl ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)、[kie-chi](https://kie-chi.com/2024/11/13/CO_P4/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

```verilog
wire cptl = (Opcode_DEin == 6'b111110) ? 1 : 0;
```

即 I 型指令，`opcode = 6'b111110`，`offset` 需符号扩展，跳转目标与 `beq` 相同（`PC+4+sign_ext(offset<<2)`）。

## 格式

博客未给出。

## 描述

> **P4T2添加指令为 cptl**，**I型指令**（注意，这个**不是J型指令**，跳转方式和 `beq` 类似）。具体操作为，若 `GPR[rs]` 的低18位的二进制表示中存在连续6个1，则将 `PC+8` 存于 `GPR[rt]` 中，否则将 `PC+8` 存于 `GPR[31]` 中。之后，把 `PC` 的值**无条件修改**为 `PC + 4 + {sign_ext}(offset<<2 || 0^2)`。

## 说明

- 来源文章《BUAA-CO-P5习题分析》"跳转类 (1) 判断+回写（地址不确定）+跳转"一节，标 `P4T2`。博客未说明年份/轮次。
- 年份/轮次存疑：同年（2024 秋）另一博主 owpeter 记录的 2024 P4 上机三题为 `SWMM`(opcode 110100) / `ES`(opcode 101100) / `IBS`(func 101001)，与本题指令名完全不同；CO 上机分第一轮/第二轮，故本文的 `P4T1/P4T2` 应属另一轮次或往年题，`year: 2024` 只按文章发布年取。
- 博客未给出测试用例。原文写作 `{sign_ext}(offset<<2 || 0^2)`，意为 `offset` 左移 2 位、低 2 位补 0 后符号扩展。

## 出处

- 来源博客：jiangshiyi（真题）、kie-chi（真题）
- 原始链接：https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/、https://kie-chi.com/2024/11/13/CO_P4/
- 类型：真题；整理自博客原文，未经课程组核对。
