# P5-P6_lwse_blog

## 题目：lwse（Load Word with Sum-selected Even Register）

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | rt | offset |

## 格式

`lwse rt, offset(base)`

## 描述

加载一个32位字，将它与旧GPR[rt]的和按位与0x1e，所得值作为目的寄存器编号，将加载字写入该寄存器。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
temp ← (memword + GPR[rt]) and 0x0000001e
GPR[temp<sub>4..0</sub>] ← memword
</pre>

## 限制与异常

目的编号只能为0、2、4、…、30；编号为0时寄存器组不变。
