# P5-P6_区间地址写31号_blog

## 题目：按加载字的地址特征选择目的寄存器

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

加载一个32位字。将它作为无符号数与0x00003000比较；若不小于该值且低两位均为0，写入GPR[31]，否则写入GPR[rt]。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
if (0 || memword) ≥ (0 || 0x00003000) and memword<sub>1..0</sub> = 0 then
    GPR[31] ← memword
else
    GPR[rt] ← memword
endif
</pre>

## 限制与异常

阈值条件没有上界；检查对象为加载字。rt=31时两分支写入同一寄存器。
