# P4_ibs_2024_blog

## 题目：条件选择目的寄存器与位变换

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `000000` | `rs` | `rt` | `rd` | `00000` | `101001` |

## 描述

根据 GPR[rt] 的判定结果，选择将 GPR[rs] 变换后写入 GPR[rd]，或将 GPR[rs] 原值写入 GPR[rt]。

## 操作

<pre>
condition ← true
for i in 0 .. 15
    if GPR[rt]<sub>i</sub> ≠ GPR[rt]<sub>31-i</sub> then
        condition ← false
    endif
endfor
for i in 0 .. 31
    result<sub>i</sub> ← GPR[rs]<sub>31-i</sub>
endfor
if condition then
    GPR[rd] ← result
else
    GPR[rt] ← GPR[rs]
endif
</pre>

## 补充条件

sym判定定义为32位二进制回文：对所有i=0至15，GPR[rt]的第i位等于第31−i位时为真，包括全0和全1。

bitwise定义为32位逐位逆序，第i位变为第31−i位，不取反。sym为真时将逆序rs写rd，否则将rs原值写rt。

判定和变换均读取执行前的32位源值；寄存器重合不改变取值次序。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

本指令在单周期中完成，无延迟槽，不新增异常；普通顺序执行时PC增加4。
