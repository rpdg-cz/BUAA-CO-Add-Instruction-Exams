# P5-P6_bnvl_blog

## 题目：bnvl（Branch on Negative with Variable Distance and Link）

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | rs | rt | offset |

## 格式

`bnvl rs, rt, offset`

## 描述

GPR[rs]为负时，跳转到offset加2的k次方条指令之后的位置，k取GPR[rt]低两位；否则不跳转。无论是否跳转，均将PC+8写入GPR[31]。

## 操作

<pre>
I: condition ← (GPR[rs] &lt; 0)
   k ← GPR[rt]<sub>1..0</sub>
   target_offset ← (sign_extend(offset) + 2<sup>k</sup>) × 4
   GPR[31] ← PC + 8
I+1: if condition then
         PC ← PC + target_offset
     endif
</pre>

## 限制与异常

k的范围为0到3，对应附加条数1、2、4、8。

## 补充条件

rs的负值判定按32位补码；k为rt低两位的无符号数。offset为16位补码，先按整数符号扩展，再加2的k次方，最后乘4。

跳转基址为本指令PC+4，跳转目标为PC+4+4×(sign_extend(offset)+2的k次方)，最终取低32位，计算中不对中间指令条数作16位截断。

无论跳转与否均执行一条延迟槽并写31为本指令PC+8。输入保证采用的目标字对齐且位于已加载指令区。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

流水线转发、暂停应保证与按程序顺序执行等价。普通顺序执行时PC增加4；控制转移的延迟槽内不放置另一条控制转移指令。本题不新增P7异常机制。
