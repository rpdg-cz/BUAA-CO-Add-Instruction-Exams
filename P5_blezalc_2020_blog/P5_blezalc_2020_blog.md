# P5_blezalc_2020_blog

## 题目：非正分支并条件链接

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `xxxxx` | `offset` |

## 描述

将 GPR[rs] 按 32 位补码解释。数值小于或等于 0 时进行相对分支，并将 PC + 8 写入 GPR[31]；大于 0 时不分支、不链接。两种情况下均执行延迟槽。

## 操作

<pre>
I:   condition ← GPR[rs] ≤ 0
     target_offset ← sign_extend(offset || 0<sup>2</sup>)
     if condition then
         GPR[31] ← PC + 8
     endif
I+1: if condition then
         PC ← PC + target_offset
     endif
</pre>

## 其他

零与所有负数均满足分支条件。条件不成立时，GPR[31] 保持原值。
