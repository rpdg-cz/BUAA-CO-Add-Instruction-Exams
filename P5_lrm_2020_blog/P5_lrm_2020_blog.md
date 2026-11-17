# P5_lrm_2020_blog

## 题目：由内存数据选择目的寄存器

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

按基址加符号偏移读取内存字，将所读字低 5 位作为目的寄存器编号，把 GPR[rt] 的完整 32 位值写入该寄存器。内存只读不写。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
mem_reg ← memword<sub>4..0</sub>
GPR[mem_reg] ← GPR[rt]
</pre>

## 其他

目的编号为 0 时写入不改变 GPR[0]。目的与 base 或 rt 相同时，地址和写入数据仍取修改前的源值。整字读取地址须按字对齐。
