# P5_bmoal_2024_blog

## 题目：一位多于零位时分支并链接

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `00000` | `offset` |

## 描述

统计 GPR[rs] 的 32 位中 1 与 0 的数量。仅当 1 的数量严格大于 0 的数量时进行相对分支，并将 PC + 8 写入 GPR[31]；否则不链接。延迟槽指令在两种情况下均执行。

## 操作

<pre>
I:   count ← 0
     for i in 0 .. 31
         if GPR[rs]<sub>i</sub> = 1 then
             count ← count + 1
         endif
     endfor
     condition ← count &gt; 16
     target_offset ← sign_extend(offset || 0<sup>2</sup>)
     if condition then
         GPR[31] ← PC + 8
     endif
I+1: if condition then
         PC ← PC + target_offset
     endif
</pre>

## 其他

恰有 16 个 1 时不分支、不链接；至少有 17 个 1 时分支并链接。符号位参与计数。
