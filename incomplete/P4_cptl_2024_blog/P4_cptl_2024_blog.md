# P4_cptl_2024_blog

## 题目：检测连续一位段并无条件跳转链接

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `111110` | `rs` | `rt` | `offset` |

## 格式

`cptl rs, rt, label`

## 描述

检测 GPR[rs] 低 18 位中是否存在至少 6 个连续的 1。存在时将链接值写入 GPR[rt]，否则写入 GPR[31]。以 PC + 4 为基址加符号分支位移，无条件跳转。

## 操作

<pre>
condition ← false
for i in 0 .. 12
    if GPR[rs]<sub>i+5..i</sub> = 1<sup>6</sup> then
        condition ← true
    endif
endfor
PC ← PC + 4 + sign_extend(offset || 0<sup>2</sup>)
</pre>

## 其他

连续 1 位段可从低 18 位内任意合法起点开始，高 14 位不参与判定。条件只选择链接目的，不影响是否跳转。
