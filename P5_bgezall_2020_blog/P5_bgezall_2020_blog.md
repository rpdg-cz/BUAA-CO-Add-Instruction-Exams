# P5_bgezall_2020_blog

## 题目：非负分支、无条件链接及未跳转时作废延迟槽

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

将 GPR[rs] 按 32 位补码解释。无论其正负均将 PC + 8 写入 GPR[31]；非负时分支并执行延迟槽，负数时不分支并作废延迟槽。

## 操作

<pre>
I:   condition ← GPR[rs] ≥ 0
     target_offset ← sign_extend(offset || 0<sup>2</sup>)
     GPR[31] ← PC + 8
I+1: if condition then
         PC ← PC + target_offset
     else
         NullifyCurrentInstruction()
     endif
</pre>

## 其他

零满足分支条件。作废的延迟槽指令不产生寄存器或内存副作用，但本指令的链接写入仍发生。
