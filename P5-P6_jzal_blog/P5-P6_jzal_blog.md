# P5-P6_jzal_blog

## 题目：jzal（Jump on Zero and Link）

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | xxxxx | xxxxx | xxxxxx |

## 格式

`jzal rs, rt`

## 描述

GPR[rt]为零时，将本指令PC+8写入GPR[31]，执行延迟槽后跳转到GPR[rs]指定的地址；否则不跳转、不链接。

## 操作

<pre>
I:
    target ← GPR[rs]
    condition ← (GPR[rt] = 0)
    if condition then
        GPR[31] ← PC + 8
    endif
I+1:
    if condition then
        PC ← target
    endif
</pre>

## 限制与异常

两种情况均执行延迟槽。rs=31时，目标取链接写回前的GPR[31]。
