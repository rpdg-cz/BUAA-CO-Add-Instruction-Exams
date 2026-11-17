# P6_wtd_2024_blog

## 题目：循环移位和的无符号比较

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| 000000 | rs | rt | rd | xxxxx | 000011 |

## 描述

分别求GPR[rs]、GPR[rt]的全部32种循环移位结果之和，每次累加保留低32位。将两个和按无符号数比较；左侧较大写1，较小写−1，相等写0到GPR[rd]。

## 操作

<pre>
L ← 0<sup>32</sup>
R ← 0<sup>32</sup>
A ← GPR[rs]
B ← GPR[rt]
for i in 0 .. 31
    temp ← L + A
    L ← temp<sub>31..0</sub>
    temp ← R + B
    R ← temp<sub>31..0</sub>
    A ← A<sub>0</sub> || A<sub>31..1</sub>
    B ← B<sub>0</sub> || B<sub>31..1</sub>
endfor
if (0 || L) &gt; (0 || R) then
    GPR[rd] ← 1
else
    if (0 || L) &lt; (0 || R) then
        GPR[rd] ← 1<sup>32</sup>
    else
        GPR[rd] ← 0
    endif
endif
</pre>

## 限制与异常

32种循环移位包括原数本身。−1以32位全一写回。
