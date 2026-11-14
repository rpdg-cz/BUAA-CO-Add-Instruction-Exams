# P3_Gray_code_2024_blog — 题解

> 项目：P3 ｜ 指令：Gray_code ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/10/28/CO/CO-p3-course/)

## 题解

> 看着挺复杂，其实还好。先建个 gray 码的转换模块。这个 for 循环的意思其实就是每 2 位取 imm，取完之后进行格雷码转换，换完先别急着 `bit_adder`，用 `splitter` 合成 32 位数之后再 `bit_adder`，否则加法过程中可能会出现溢出！
>
> 另外这个操作属于改版的 `beq`，PC 转移的方法和 `beq` 是一致的，所以可以这样和 `beq` 共用一个 NPCOp 码

- 要点：(1) 先写 `gray` 子模块；(2) 每 2 位取 imm → 转格雷码 → splitter 拼成 32 位 → 再 bit_adder（否则逐段相加会溢出）；(3) 跳转与 `beq` 共用 NPCOp。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
