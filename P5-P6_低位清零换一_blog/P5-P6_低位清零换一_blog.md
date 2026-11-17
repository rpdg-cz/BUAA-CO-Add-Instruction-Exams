# P5-P6_低位清零换一_blog

## 题目：从低位起将零位改为一

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | rd | xxxxx | xxxxxx |

## 描述

按位号0到31扫描GPR[rs]，将遇到的前GPR[rt]个零位改为一，原来为一的位不计数。若零位不足，全部零位均改为一。结果写入GPR[rd]。GPR[rt]表示无符号非负数量。

## 操作

<pre>
temp ← GPR[rs]
remaining ← 0 || GPR[rt]
for i in 0 .. 31
    if temp<sub>i</sub> = 0 and remaining &gt; 0 then
        temp<sub>i</sub> ← 1
        remaining ← remaining - 1
    endif
endfor
GPR[rd] ← temp
</pre>

## 限制与异常

数量为0时结果不变；数量不少于GPR[rs]中零位总数时，结果为0xffffffff。
