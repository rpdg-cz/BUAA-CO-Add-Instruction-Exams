# P7_Watch异常_2024_blog — 题解

> 项目：P7 ｜ 指令：watch ｜ 年份：2024 ｜ 来源：[UHO](https://theuho.site/2024/12/11/COexamP7/)

## 题解

- 思路一：**在 D 级**判断 D 指令是否触发 IMWatch，同时在冒险阻塞单元中特判——若 D 级或 M 级是 mtc0 指令且修改了 `WatchLo`/`WatchHi`，则阻塞 D 级指令，直到拿到正确的 `WatchLo`/`WatchHi` 再判断；E 级乘除器 MDU 需要特判出现 IMWatch 异常则禁止乘除槽。
- DMWatch：针对不同存取指令比较"拓展后的地址范围"与 `WatchLo` 低 16 位零扩展后的地址，例如 `lw`/`sw` 比较 `[32:2]` 是否相等，`lh`/`sh` 比较 `[32:1]`，`lb`/`sb` 比较 `[32:0]`；并特判 `WatchHi[0..3]` 是否打开，否则不触发。
- 思路二：IM/DM 异常都在 **M 级**判断，只需实现 MDU 的撤销——本博客的 CPU 在触发乘除槽的当回合就把结果存入 `tempHi`/`tempLo`，故 M 级判出异常后把 `tempHi`、`tempLo`、计数器、busy 等清零即可。
- 坑点（博客强调）：

> `WatchLo` 和 `WatchHi` 需要支持全部 32 位的读写，不能在 F 级判断 IM 异常，否则需要阻塞前面的 mtc0 指令一直到 M 级结束，这将导致 TLE。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
