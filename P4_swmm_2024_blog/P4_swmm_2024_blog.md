# P4_swmm_2024_blog

> 项目：P4 ｜ 指令：swmm ｜ 年份：2024 ｜ 类型：回忆版 ｜ 来源：[owpeter](https://owpeter.github.io/2024/11/12/CO/CO-p4-course/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> **SWMM**
> `110100 | base | rt | offset`

位域（博客原文）：

```text
SWMM
110100
base
rt
offset
```

## 说明

- 来源文章《BUAA-CO-p4-课上》（2024-11-12），**2024 年 P4 上机第 1 题**（加指令题；文内未逐题标号，题号按博客出现顺序 `SWMM→ES→IBS` 推定）。
- 博客只给了指令名 `SWMM`、opcode `110100`（0x34）和 `base/rt/offset` 位域，**没有文字描述该指令的语义**（作者直接在题解里讲怎么改自己的 DM），故标 `回忆版`。从"store 类 + 在自己的 DM 里加一个写模式"可判断是 `sw` 的变体（store 类、带 offset），具体写什么值需按题面。
- 博客未给测试用例。

## 出处

- 来源博客：owpeter（回忆版）
- 原始链接：https://owpeter.github.io/2024/11/12/CO/CO-p4-course/
- 类型：回忆版；整理自博客原文，未经课程组核对。
