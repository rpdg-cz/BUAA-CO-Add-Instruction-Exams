# P6_fmultu_2024_blog

## 题目：按乘积位位置翻转一位的无符号乘法

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | xxxxx | xxxxx | xxxxxx |

## 描述

计算两个32位无符号源的完整64位乘积。高32位为零时直接写HI、LO；否则找到最高位1的位置h和最低位0的位置z，翻转第|h−z|位后，将高、低32位分别写入HI、LO。计算占用3个周期。

## 操作

<pre>
product ← (0 || GPR[rs]) × (0 || GPR[rt])
if product<sub>63..32</sub> ≠ 0 then
    for i in 0 .. 63
        if product<sub>i</sub> = 1 then
            h ← i
        endif
    endfor
    for i in 63 .. 0 step -1
        if product<sub>i</sub> = 0 then
            z ← i
        endif
    endfor
    if h ≥ z then
        k ← h - z
    else
        k ← z - h
    endif
    product<sub>k</sub> ← product<sub>k</sub> xor 1
endif
HI ← product<sub>63..32</sub>
LO ← product<sub>31..0</sub>
</pre>

## 限制与异常

位号从最低位0开始。高32位为零时不查找或翻转；高32位非零时，乘积中必然同时存在1与0，k在0到63之间。
