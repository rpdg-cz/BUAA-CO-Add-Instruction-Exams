# P6_msub_2020_blog

## 题目：有符号乘积从HI/LO中减去

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | xxxxx | xxxxx | xxxxxx |

## 描述

计算两个32位补码数的完整64位乘积，从旧HI与LO拼接的64位数中减去该乘积，将结果高、低32位分别写入HI、LO。

## 操作

<pre>
product ← GPR[rs] × GPR[rt]
temp ← (HI || LO) - product
HI ← temp<sub>63..32</sub>
LO ← temp<sub>31..0</sub>
</pre>

## 限制与异常

乘积保留完整64位；减法结果取低64位。HI、LO同时基于旧值更新，不产生算术溢出异常。
