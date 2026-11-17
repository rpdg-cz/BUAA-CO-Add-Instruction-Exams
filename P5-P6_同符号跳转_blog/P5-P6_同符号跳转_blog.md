# P5-P6_同符号跳转_blog

## 题目：非零同符号条件分支

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

当GPR[rs]、GPR[rt]均非零且符号位相同时，以本指令PC+4为基址，加上符号扩展offset后乘4的位移进行分支。延迟槽始终执行。

## 操作

<pre>
I:
    condition ← (GPR[rs] ≠ 0) and (GPR[rt] ≠ 0) and (GPR[rs]<sub>31</sub> = GPR[rt]<sub>31</sub>)
    target_offset ← sign_extend(offset || 0<sup>2</sup>)
I+1:
    if condition then
        PC ← PC + target_offset
    endif
</pre>

## 限制与异常

GPR[rs]或GPR[rt]为零时不跳转。
