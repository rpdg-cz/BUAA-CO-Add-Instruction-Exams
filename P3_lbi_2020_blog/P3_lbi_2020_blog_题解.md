# P3_lbi_2020_blog — 题解

> 项目：P3 ｜ 指令：lbi ｜ 年份：2020 ｜ 来源：[roife](https://roife.github.io/posts/buaa-co-lab-p3/)

## 题解

> 课下如果做过了 jalr / sll / lb 那么这三题就是白送的。

按上面照录的 RTL：`byte = Addr[1:0]`，把内存字中 `byte` 位置的那一字节写回 `GPR[rt]` 的**同一字节位置**（不做符号扩展），比 `lb` 多一步"按地址低 2 位选字节位置"。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
