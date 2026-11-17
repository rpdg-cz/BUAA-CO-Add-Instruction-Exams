# P4_swrr_2020_blog

## 题目：按地址低位循环右移后存字

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

计算基址加符号偏移的有效地址，按地址低两位指定的字节数将 GPR[rt] 循环右移，再写入该地址所在的内存字。访存记录中的地址须按字对齐。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
byte ← vAddr<sub>1..0</sub>
if byte = 0 then
    memword ← GPR[rt]
else
    memword ← GPR[rt]<sub>8*byte−1..0</sub> || GPR[rt]<sub>31..8*byte</sub>
endif
memory[vAddr<sub>31..2</sub> || 0<sup>2</sup>] ← memword
</pre>

## 其他

地址低两位为 0、1、2、3 时，分别循环右移 0、8、16、24 位。记录的数据为循环移位后的完整字，记录地址为 vAddr 的低两位清零后的值。
