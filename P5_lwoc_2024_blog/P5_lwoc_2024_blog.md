# P5_lwoc_2024_blog

## 题目：依据读出字选择寄存器的加载

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `111110` | `base` | `rt` | `offset` |

## 格式

`lwoc rt, offset(base)`

## 描述

将 16 位 offset 末尾补两位 0 后符号扩展，与 GPR[base] 相加。取结果高 30 位选择内存字。若读出字按无符号数解释小于 0x80000000，则写入该字低 4 位指定的寄存器；否则写入 GPR[rt]。两种情况的写回数据均为完整读出字。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset || 0<sup>2</sup>)
memword ← memory[vAddr<sub>31..2</sub> || 0<sup>2</sup>]
if (0 || memword) &lt; (0 || 0x80000000) then
    mem_reg ← 0 || memword<sub>3..0</sub>
else
    mem_reg ← rt
endif
GPR[mem_reg] ← memword
</pre>

## 其他

读出字等于 0x80000000 时写入 rt。低 4 位目的编号为 0 时丢弃写入。offset 为 1 时，对有效地址的贡献为 4。
