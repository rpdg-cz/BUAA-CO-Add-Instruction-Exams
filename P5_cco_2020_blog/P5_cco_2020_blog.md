# P5_cco_2020_blog

## 题目：统计两个寄存器同时为一的位数

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `xxxxxx` | `rs` | `rt` | `rd` | `xxxxx` | `xxxxxx` |

## 描述

统计 GPR[rs] 与 GPR[rt] 在相同位号上均为 1 的位置数量，将计数作为 32 位非负整数写入 GPR[rd]。

## 操作

<pre>
count ← 0
for i in 0 .. 31
    if GPR[rs]<sub>i</sub> = 1 and GPR[rt]<sub>i</sub> = 1 then
        count ← count + 1
    endif
endfor
GPR[rd] ← zero_extend(count)
</pre>

## 其他

结果范围为 0 至 32，符号位与其他位同等参与计数。两个源均为 0xFFFFFFFF 时，结果为 32。
