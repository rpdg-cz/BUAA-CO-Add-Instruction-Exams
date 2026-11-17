# P5_jtl_2024_blog

## 题目：比较候选地址并跳转

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `rt` | `offset` |

## 格式

`jtl rs, rt, label`

## 描述

计算 GPR[rs] 与 GPR[rt] 的和，以及 PC + 4 加相对位移的结果。前者较大时跳至后者，否则跳至前者。

## 操作

<pre>
I: temp1 ← GPR[rs] + GPR[rt]
   temp2 ← PC + 4 + sign_extend(offset || 0<sup>2</sup>)
</pre>
