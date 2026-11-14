# P7_CP0内存限制异常_2024_blog

> 项目：P7 ｜ 指令：memory ｜ 年份：2024 ｜ 类型：真题 ｜ 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 题目

> **T5 Memory Limitation(第三次)**
>
> **题目描述**
> 在 CP0 中添加 32 位 18 号寄存器 `LowerLimit`，32 位 19 号寄存器 `UpperLimit`，可正常通过 mtc0/mfc0 修改内容，`UpperLimit[15:0]` 和 `LowerLimit[15:0]` 存上下界内存地址的 `[15:0]`，通过 32 位 0 扩展得到 `UpperAddress` 和 `LowerAddress`，对 `[LowerAddress, UpperAddress)` 内的内存读写操作进行如下限制（注意地址区间范围的开闭）。
>
> 当 `LowerLimit[31:16]` 与 `UpperLimit[31:16]` 中 1 的个数之和为**奇数**时只允许读，如果写将导致 **AdES** 异常；当 `LowerLimit[31:16]` 与 `UpperLimit[31:16]` 中 1 的个数之和为**偶数**时只允许写，如果读将导致 **AdEL** 异常。
>
> 保证 `LowerLimit[15:0] ⩽ UpperLimit[15:0]`，且 `LowerLimit[15:0]`、`UpperLimit[15:0]` 在 `0x0000-0x3000` 之间。若 `LowerLimit[15:0] == UpperLimit[15:0]`，则不限制任何内存读写。

## 说明

- 来源文章《P7课上题目回忆和思路分享[BUAA-CO]》（2024-12-11），P7 上机第 5 题（T5）的**第三次**，属课上新指令/异常处理题。前四题为课下强测（功能、转发阻塞、异常、中断强测）。
- 博客未给测试用例与异常处理程序。

## 出处

- 来源博客：UHO（真题）
- 原始链接：https://theuho.site/2024/12/11/COexamP7/
- 类型：真题；整理自博客原文，未经课程组核对。
