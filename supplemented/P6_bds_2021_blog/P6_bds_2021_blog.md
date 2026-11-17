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
if denominator ≠ 0 then
    LO ← numerator div denominator
    HI ← numerator mod denominator
endif
</pre>

## 限制与异常

两源相等且非零时，LO=1、HI=0。

## 补充条件

任一源为0时除数为0：不改变HI和LO，不产生异常，仍占用与正常除法相同的10个时钟周期。

两源都非零时进行无符号商余运算，商余均以32位写入LO、HI；两源相等时LO=1、HI=0。

位15..11不作为目的寄存器且忽略；无GPR写回。Start有效后的第1个上升沿启动，Busy覆盖10周期并含结果提交；Busy或Start有效时阻塞相关MDU指令。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

流水线转发、暂停应保证与按程序顺序执行等价。普通顺序执行时PC增加4；控制转移的延迟槽内不放置另一条控制转移指令。本题不新增P7异常机制。
