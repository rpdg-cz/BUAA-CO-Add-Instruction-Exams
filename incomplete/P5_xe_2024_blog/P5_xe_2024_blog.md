# P5_xe_2024_blog

## 题目：分组取位异或

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `xxxxxx` | `rs` | `rt` | `rd` | `xxxxx` | `xxxxxx` |

## 格式

`xe rd, rs, rt`

## 描述

依次取 GPR[rs] 与 GPR[rt] 的每个两位组的高位，计算两者的异或，最终结果写入 GPR[rd]。

## 操作

<pre>
for i in 0 .. 15
    temp ← GPR[rs]<sub>2*i+1</sub> xor GPR[rt]<sub>2*i+1</sub>
endfor
</pre>
