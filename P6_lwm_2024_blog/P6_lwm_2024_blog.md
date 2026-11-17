# P6_lwm_2024_blog

## 题目：由加载字与旧rt之差决定目的寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| 111110 | base | rt | offset |

## 描述

按lw方式加载一个32位字，减去旧GPR[rt]，以差的低五位作为目的寄存器编号，将加载字写入该寄存器。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
temp ← memword - GPR[rt]
GPR[temp<sub>4..0</sub>] ← memword
</pre>

## 限制与异常

目的编号为0时不改变寄存器组。目的计算使用写回前的GPR[rt]。
