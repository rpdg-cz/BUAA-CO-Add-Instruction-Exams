# P4_olw_2024_blog

## 题目：满足单调性条件才加载

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `base` | `rt` | `offset` |

## 格式

`olw rt, offset(base)`

## 描述

计算基址与符号扩展的 offset 末尾补两位 0 的和，读取相应内存字。读出数据满足单调不减条件时写入 GPR[rt]，否则保持 GPR[rt] 不变。

## 操作

<pre>
temp ← GPR[base] + sign_extend(offset || 0<sup>2</sup>)
vAddr ← temp<sub>31..0</sub>
pAddr ← vAddr<sub>31..2</sub> || 0<sup>2</sup>
memword ← memory[pAddr]
condition ← true
for i in 0 .. 2
    if (0 || memword<sub>31-8*i..24-8*i</sub>) &gt; (0 || memword<sub>23-8*i..16-8*i</sub>) then
        condition ← false
    endif
endfor
if condition then
    GPR[rt] ← memword
endif
</pre>

## 补充条件

单调不减按内存字从高位到低位的4个无符号字节判定，即位31..24、23..16、15..8、7..0依次不减，允许相等。

offset为16位补码字偏移；地址相加取低32位，再清零低两位，以对齐后地址读取整个32位字。输入保证对齐后地址在0x0000至0x2ffc。

无论判定是否成立都读取数据；不成立时不写任何寄存器，不是写回rt旧值。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

本指令在单周期中完成，无延迟槽，不新增异常；普通顺序执行时PC增加4。
