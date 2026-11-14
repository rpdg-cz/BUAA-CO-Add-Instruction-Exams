# P3_wsbh_2020_blog

> 项目：P3 ｜ 指令：wsbh ｜ 年份：2020 ｜ 类型：真题 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 编码

博客未给出编码（opcode / func）。

## 格式

博客未给出。

## 描述

> 第二题：wsbh
>
> 这个指令在格式上比较类似于移位指令 sll，不过不需要用到 shamt。只要稍微修改一下 ALU 就好了。

$$
GPR[rd] \leftarrow GPR[rt]_{23..16}\ ||\ GPR[rt]_{31..24}\ ||\ GPR[rt]_{7..0}\ ||\ GPR[rt]_{15..8}
$$

## 说明

- 考试形式：P3 上机（Logisim 单周期 CPU 加指令），本次三道题中的第二题（计算类）。
- 年份：2020（文章发布 2020-11-15）。
- 博客未给出 opcode/funct 编码与测试点。

## 出处

- 来源博客：roife（真题）
- 原始链接：https://roife.github.io/posts/buaa-co-lab-p3/
- 类型：真题；整理自博客原文，未经课程组核对。
