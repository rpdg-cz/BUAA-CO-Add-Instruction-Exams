# P6_btd_2024_blog

## 题目：双寄存器变距无条件分支

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| 111110 | rs | rt | offset |

## 描述

将两源的32位和最低位清零后左移一位得到d。以d低30位拼接两个零，再加符号扩展offset作为相对PC+4的位移。执行延迟槽后无条件跳转，不链接。

## 操作

<pre>
I:
    temp ← GPR[rs] + GPR[rt]
    sum ← temp<sub>31..0</sub>
    d ← sum<sub>30..1</sub> || 0<sup>2</sup>
    temp ← (d<sub>29..0</sub> || 0<sup>2</sup>) + sign_extend(offset)
    target_offset ← temp<sub>31..0</sub>
I+1:
    PC ← PC + target_offset
</pre>

## 限制与异常

offset符号扩展后直接相加，不乘4。
