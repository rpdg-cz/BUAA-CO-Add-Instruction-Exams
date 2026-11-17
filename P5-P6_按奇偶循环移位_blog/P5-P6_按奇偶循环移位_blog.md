# P5-P6_按奇偶循环移位_blog

## 题目：由奇偶性选择方向的循环移位

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

移位量取GPR[rt]的低五位。GPR[rt]为奇数时，将GPR[rs]循环左移；为偶数时循环右移，结果写入GPR[rd]。

## 操作

<pre>
temp ← GPR[rs]
n ← GPR[rt]<sub>4..0</sub>
for i in 1 .. n
    if GPR[rt]<sub>0</sub> = 1 then
        temp ← temp<sub>30..0</sub> || temp<sub>31</sub>
    else
        temp ← temp<sub>0</sub> || temp<sub>31..1</sub>
    endif
endfor
GPR[rd] ← temp
</pre>

## 限制与异常

n=0时结果等于原GPR[rs]。移出的位从另一端补入。
