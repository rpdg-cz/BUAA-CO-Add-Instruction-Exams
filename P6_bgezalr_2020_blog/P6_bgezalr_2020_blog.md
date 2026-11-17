# P6_bgezalr_2020_blog

## 题目：非负条件寄存器跳转并无条件链接

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | rd | xxxxx | xxxxxx |

## 描述

GPR[rs]为非负补码数时，执行延迟槽后跳转到旧GPR[rt]指定的地址。无论是否跳转，均将本指令PC+8写入GPR[rd]。

## 操作

<pre>
I:
    condition ← (GPR[rs] ≥ 0)
    target ← GPR[rt]
    GPR[rd] ← PC + 8
I+1:
    if condition then
        PC ← target
    endif
</pre>

## 限制与异常

rs为零时满足条件。rd与rs或rt相同也使用链接写回前的源值。延迟槽始终执行。
