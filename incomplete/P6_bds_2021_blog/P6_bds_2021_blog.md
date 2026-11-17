# P6_bds_2021_blog

## 题目：无符号较大数除以较小数

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| 000000 | rs | rt | xxxxx | 00000 | 001010 |

## 格式

`bds rs, rt`

## 描述

将两个源寄存器看作32位无符号数，以较大者为被除数、较小者为除数，商写LO，余数写HI。计算占用时间与除法相同。

## 操作

以下为除数非零时的操作。

<pre>
A ← 0 || GPR[rs]
B ← 0 || GPR[rt]
if A ≥ B then
    numerator ← A
    denominator ← B
else
    numerator ← B
    denominator ← A
endif
LO ← numerator div denominator
HI ← numerator mod denominator
</pre>

## 限制与异常

两源相等且非零时，LO=1、HI=0。
