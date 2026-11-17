# P5_swc_2021_blog

## 题目：按位计数奇偶决定循环移位

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `000000` | `rs` | `rt` | `rd` | `00000` | `001010` |

## 格式

`swc rd, rs, rt`

## 描述

根据 GPR[rt] 中 0 的个数的奇偶性，将 GPR[rs] 循环左移或右移后写入 GPR[rd]。含奇数个 0 时向左，含偶数个 0 时向右，移位量取 GPR[rt] 的低 5 位。GPR[rt] 整个值为 0 时不写回。

## 操作

<pre>
A ← GPR[rs]
B ← GPR[rt]
n ← B<sub>4..0</sub>
count ← 0
for i in 0 .. 31
    if B<sub>i</sub> = 0 then
        count ← count + 1
    endif
endfor
if B ≠ 0 then
    if n = 0 then
        GPR[rd] ← A
    else
        if count mod 2 ≠ 0 then
            GPR[rd] ← A<sub>31−n..0</sub> || A<sub>31..32−n</sub>
        else
            GPR[rd] ← A<sub>n−1..0</sub> || A<sub>31..n</sub>
        endif
    endif
endif
</pre>

## 其他

整个 GPR[rt] 为 0 与低 5 位为 0 不等价：前者不写回；后者在寄存器值非零时仍将 GPR[rs] 写入 GPR[rd]。
