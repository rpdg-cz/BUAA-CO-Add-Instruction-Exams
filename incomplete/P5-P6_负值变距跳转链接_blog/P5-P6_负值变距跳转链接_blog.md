# P5-P6_负值变距跳转链接_blog

## 题目：负值条件变距分支并链接

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

GPR[rs]为负时，跳转到offset加2的k次方条指令之后的位置，k取GPR[rt]低两位；否则不跳转。无论是否跳转，均将PC+8写入GPR[31]。

## 操作

<pre>
I:
    condition ← (GPR[rs] &lt; 0)
    k ← GPR[rt]<sub>1..0</sub>
    GPR[31] ← PC + 8
</pre>

## 限制与异常

k的范围为0到3，对应附加条数1、2、4、8。
