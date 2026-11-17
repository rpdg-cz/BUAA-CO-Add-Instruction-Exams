# P6_jmv_2024_blog

## 题目：双寄存器与立即数组合的相对跳转

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

将两源的32位和清除最低位后逻辑右移一位得到d。将d低30位拼接两个零，与offset拼接两个零后符号扩展的结果相加，作为相对PC+4的位移。执行延迟槽后跳转，不链接。

## 操作

<pre>
I:
    temp ← GPR[rs] + GPR[rt]
    sum ← temp<sub>31..0</sub>
    d ← 0 || sum<sub>31..1</sub>
    temp ← sign_extend(offset || 0<sup>2</sup>) + (d<sub>29..0</sub> || 0<sup>2</sup>)
    target_offset ← temp<sub>31..0</sub>
I+1:
    PC ← PC + target_offset
</pre>

## 限制与异常

右移时高位补零。立即数先拼接两个零再符号扩展，目标为字对齐。
