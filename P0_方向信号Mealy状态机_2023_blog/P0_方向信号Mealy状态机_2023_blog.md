# P0_方向信号Mealy状态机_2023_blog

> 项目：P0 ｜ 年份：2023 ｜ 类型：真题 ｜ 来源：[Hugo](https://www.hugohealthy.top/2023/10/10/CO-P0-logisim%E7%9B%B8%E5%85%B3/)、[fysszlr](https://www.fysszlr.top/2023/10/10/CO-P0%E4%B8%8A%E6%9C%BA%E8%AE%B0%E5%BD%95/)、[owpeter](https://owpeter.github.io/2024/09/12/CO/BUAA-CO-%E5%89%8D%E4%BC%A0/)
>
> 本题来自博客记录（非官方题面），文字为博主原文或回忆版，缺失字段以“博客未给出”标注。

## 题目

博客原文（第二题，"题目描述：" 下先是一张题面截图，随后是文字补充）：

> 输入为2bit方向信号，1bit clk，1bit reset(异步复位，直接接在寄存器reset端即可)。
>
> 类似课下的navigation的题目，这里题目要求使用mealy状态机。最开始位于1处，根据输入的2bit方向信息前往下一个位置，如果没有（或者撞墙）则停留在当前位置。输出为下一步的位置标号。
>
> 输出4bit位置信号

博客未用文字给出棋盘格的具体形状与"位置标号"的编号规则——这部分只存在于题面截图 `3.png` 中，博客未转录为文字。

## 说明

- 考试形式：**做题类**——Logisim 时序逻辑（状态机）设计（P0 上机）。
- 年份：2023（文章发布 2023-10-10，博主 2022 级）。博客未显式写"上机/考试"字样，按"关于本次P0 + 第一/二/三题"编号推断为当次 P0 上机题。
- 原文自述"**类似课下的navigation的题目**"，即与课下 navigation 同题材但**要求用 Mealy 机**、输入为 2bit 方向信号——可见本题不是课下 `L1_navigation` 原题。
- 端口线索（来自博客文字）：输入 `2bit 方向信号` + `clk` + `reset`（异步复位，直接接寄存器 reset 端）；输出 `4bit 位置信号`。
- 题面原图：`/2023/10/10/CO-P0-logisim相关/3.png`（博客未转录）。

## 出处

- 来源博客：Hugo（真题）、fysszlr（回忆版）、owpeter（真题）
- 原始链接：https://www.hugohealthy.top/2023/10/10/CO-P0-logisim%E7%9B%B8%E5%85%B3/、https://www.fysszlr.top/2023/10/10/CO-P0%E4%B8%8A%E6%9C%BA%E8%AE%B0%E5%BD%95/、https://owpeter.github.io/2024/09/12/CO/BUAA-CO-%E5%89%8D%E4%BC%A0/
- 类型：真题；整理自博客原文，未经课程组核对。
