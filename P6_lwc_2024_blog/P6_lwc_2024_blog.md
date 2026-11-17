# P6_lwc_2024_blog

## 题目：按加载字奇偶选择rt或31号寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | rt | offset |

## 描述

按lw方式加载一个32位字。加载字为偶数时写GPR[rt]，为奇数时写GPR[31]。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
if memword<sub>0</sub> = 0 then
    GPR[rt] ← memword
else
    GPR[31] ← memword
endif
</pre>

## 限制与异常

奇偶性只取决于加载字最低位。rt=31时两分支写同一寄存器。
