# Pre_字符自动机_2021_blog — 题解

> 项目：Pre ｜ 年份：2021 ｜ 来源：[Xlucidator](https://www.cnblogs.com/xlucidator/p/15404757.html)

## 题解

（博客原文要点）

1. 审题·惯性思维：直接输出了当前连续数，题目要求是最大连续数。
2. 非阻塞赋值运用：若在 `always` 块内通过 `if(out1 > max) max <= out1` 更新 max 值，需要考虑 `out1` 的更新靠非阻塞赋值，比较时 `out1` 取更新前的值。所以应该使用 `if(out+1 > max) max <= out + 1`。（也可以将 max 的更新挪至 case 外 always 内，并在顺序块外通过 `assign out = (out > max) ? out : max` 来消除更新不及时的问题）
3. 状态转移疏漏：`"csc"` 状态下输入 `"s"` 时，应转移到 `"cs"` 状态而非 `""` 状态（博主此题未解决，挂）。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
