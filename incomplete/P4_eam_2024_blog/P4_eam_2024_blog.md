# P4_eam_2024_blog

## 题目：有符号取模与条件扩展

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `000000` | `rs` | `rt` | `rd` | `xxxxx` | `111110` |

## 格式

`eam rd, rs, rt`

## 描述

将 GPR[rs] 的低 16 位解释为补码，对 17 求取 0 至 16 范围内的余数。依据 GPR[rt] 的符号，将该 16 位余数作零扩展或高位补 1 后写入 GPR[rd]。

## 操作

<pre>
temp ← sign_extend(GPR[rs]<sub>15..0</sub>)
result ← temp mod 17
if result &lt; 0 then
    result ← result + 17
endif
</pre>
