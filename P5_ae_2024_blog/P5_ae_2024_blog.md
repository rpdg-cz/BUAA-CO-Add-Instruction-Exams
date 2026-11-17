# P5_ae_2024_blog

## 题目：立即数与相邻位异或结果拼接

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `rs` | `00000` | `imm` |

## 描述

将 16 位立即数放入结果的低 16 位。结果的第 16 位等于立即数最低位，其余高位依次为立即数当前位与前一位的异或。将结果写入 GPR[rs]。

## 操作

<pre>
temp<sub>15..0</sub> ← imm<sub>15..0</sub>
temp<sub>16</sub> ← imm<sub>0</sub> xor 0
for i in 1 .. 15
    temp<sub>16+i</sub> ← imm<sub>i</sub> xor imm<sub>i−1</sub>
endfor
GPR[rs] ← temp
</pre>

## 其他

立即数按 16 位位串使用，不先作符号扩展。GPR[rs] 的旧值不参与运算。imm 为 0xFFFF 时，结果为 0x0001FFFF。
