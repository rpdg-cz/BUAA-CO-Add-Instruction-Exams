# P6_msub_2020_blog — 题解

> 项目：P6 ｜ 指令：msub ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p6/)

## 题解

> 标准指令集里面有这个指令。

博主在"分析"一节给出的 `$signed` 坑（P6 计算类通用）：下面两种写法都会出错

```verilog
// 出错写法 1
{temp_hi, temp_lo} <= {hi, lo} + $signed(rs) * $signed(rt);
// 出错写法 2
{temp_hi, temp_lo} <= {hi, lo} + $signed($signed(rs) * $signed(rt));
```

正确写法（人为传入 64 位位宽 / 手动符号扩展）：

```verilog
{temp_hi, temp_lo} <= {hi, lo} + $signed($signed(64'd0) + $signed(rs) * $signed(rt));
// 或者
{temp_hi, temp_lo} <= {hi, lo} + $signed({{32{rs[31]}}, rs[31:0]} * $signed({{32{rt[31]}}, rt[31:0]}));
```

另外乘除指令要模拟时延（"两种乘法延时 5 个周期，两种除法延时 10 个周期"），用 `busy`/`start` 控制 stall。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
