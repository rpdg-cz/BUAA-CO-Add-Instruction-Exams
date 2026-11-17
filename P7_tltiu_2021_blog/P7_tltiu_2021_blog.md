# P7_tltiu_2021_blog

## 题目：无符号小于符号扩展立即数时陷入

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | rs | 01011 | immediate |

## 格式

`tltiu rs, immediate`

## 描述

将16位立即数符号扩展到32位，再把GPR[rs]和扩展结果作为无符号32位数比较。源值较小时产生Trap异常，ExcCode=13。

## 操作

<pre>
temp ← sign_extend(immediate)
if (0 || GPR[rs]) &lt; (0 || temp) then
    SignalException(Trap)
endif
</pre>

## 限制与异常

immediate=0xffff时，扩展结果为0xffffffff；immediate=0时条件不成立。不写GPR、HI、LO或数据存储器。
