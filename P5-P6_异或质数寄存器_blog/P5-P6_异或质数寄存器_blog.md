# P5-P6_异或质数寄存器_blog

## 题目：按加载字与寄存器和选择目的寄存器

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

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
