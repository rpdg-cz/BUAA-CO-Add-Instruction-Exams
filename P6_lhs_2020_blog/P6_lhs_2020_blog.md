# P6_lhs_2020_blog

## 题目：偶地址选择并符号扩展一个字节

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | rt | offset |

## 描述

由GPR[base]加符号扩展offset得到有效地址。读取该地址所在的对齐字；地址低两位为00时取最低字节，为10时取位23到16的字节，将所取字节符号扩展后写GPR[rt]。其他地址不写回。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
pAddr ← vAddr<sub>31..2</sub> || 0<sup>2</sup>
memword ← memory[pAddr]
if vAddr<sub>1..0</sub> = 0 then
    GPR[rt] ← sign_extend(memword<sub>7..0</sub>)
else
    if vAddr<sub>1..0</sub> = 2 then
        GPR[rt] ← sign_extend(memword<sub>23..16</sub>)
    endif
endif
</pre>

## 限制与异常

写入的是8位字节的符号扩展。奇数地址时GPR[rt]保持不变。
