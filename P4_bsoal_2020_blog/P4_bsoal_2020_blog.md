# P4_bsoal_2020_blog

## 题目：一位计数为奇数时分支并链接

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `xxxxx` | `offset` |

## 描述

统计 GPR[rs] 全部 32 位中 1 的个数。计数为奇数时进行相对分支，并将 PC + 4 写入 GPR[31]；否则顺序执行且不写 GPR[31]。

## 操作

<pre>
count ← 0
for i in 0 .. 31
    if GPR[rs]<sub>i</sub> = 1 then
        count ← count + 1
    endif
endfor
if count mod 2 = 1 then
    GPR[31] ← PC + 4
    PC ← PC + 4 + sign_extend(offset || 0<sup>2</sup>)
endif
</pre>

## 其他

计数包含符号位。全零与全一分别含 0 个和 32 个 1，均不分支。
