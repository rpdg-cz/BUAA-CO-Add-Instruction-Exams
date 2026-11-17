# P6_shl_2022_blog

## 题目：交换HI与LO

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

交换HI、LO的32位值，不写通用寄存器。

## 操作

<pre>
temp ← HI
HI ← LO
LO ← temp
</pre>

## 限制与异常

连续两次交换恢复原值。
