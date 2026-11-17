# P5_bcl_blog

## 题目：bcl（Branch Comparison and Link）

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `rt` | `offset` |

## 格式

`bcl rs, rt, offset`

## 描述

比较本指令地址加相对偏移的结果与 GPR[rs] + GPR[rt]。前者较小时，以 PC + 4 为基址按相对偏移跳转并执行延迟槽；否则跳至寄存器之和并作废延迟槽。两种情况下均将 PC + 8 写入 GPR[31]。

## 操作

<pre>
I: target_offset ← sign_extend(offset || 0<sup>2</sup>)
   temp ← PC + target_offset
   A ← temp<sub>31..0</sub>
   temp ← GPR[rs] + GPR[rt]
   B ← temp<sub>31..0</sub>
   condition ← ((0 || A) &lt; (0 || B))
   GPR[31] ← PC + 8
I+1: if condition then
         PC ← PC + target_offset
     else
         NullifyCurrentInstruction()
         PC ← B
     endif
</pre>

## 补充条件

助记符为bcl（Branch Comparison and Link）。

相对位移为16位offset符号扩展后乘4；两种比较输入分别为本指令PC加位移、rs加rt，每次加法均先取低32位，再作无符号比较。

比较的相对输入比真正相对目标少4，不能合并。小于时保留一条延迟槽，否则仅作废紧随本指令的一条延迟槽；相等走寄存器和路径。

两条路径都把本指令PC+8写入31；输入保证最终选择的目标字对齐并位于已加载指令区。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

流水线转发、暂停应保证与按程序顺序执行等价。普通顺序执行时PC增加4；控制转移的延迟槽内不放置另一条控制转移指令。本题不新增P7异常机制。
