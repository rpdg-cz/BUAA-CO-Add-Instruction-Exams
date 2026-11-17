# P5-P6_较小偶数跳转链接_blog

## 题目：较小有符号数为偶数时分支并链接

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

将GPR[rs]、GPR[rt]按32位补码比较。较小者为偶数时，以PC+4加符号扩展offset后乘4的位移为目标分支；否则作废延迟槽。无论是否跳转，均将本指令PC+8写入GPR[31]。

## 操作

<pre>
I:
    if GPR[rs] ≤ GPR[rt] then
        temp ← GPR[rs]
    else
        temp ← GPR[rt]
    endif
    condition ← (temp<sub>0</sub> = 0)
    target_offset ← sign_extend(offset || 0<sup>2</sup>)
    GPR[31] ← PC + 8
I+1:
    if condition then
        PC ← PC + target_offset
    else
        NullifyCurrentInstruction()
    endif
</pre>

## 限制与异常

负偶数满足偶数条件；两源相等时比较选择不影响结果。条件不成立时仍写链接值，但延迟槽不产生副作用。
