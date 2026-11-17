# P6_lwmx_2021_blog

## 题目：比较加载字后写4号或5号寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| 101010 | base | rt | offset |

## 格式

`lwmx rt, offset(base)`

## 描述

从GPR[base]加符号扩展offset的地址加载一个32位字。将加载字与旧GPR[rt]按补码比较；加载字较大时写入GPR[5]，否则写入GPR[4]。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
if memword &gt; GPR[rt] then
    GPR[5] ← memword
else
    GPR[4] ← memword
endif
</pre>

## 限制与异常

相等时写4号；另一个目的寄存器保持不变。
