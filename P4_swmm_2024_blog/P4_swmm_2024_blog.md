# P4_swmm_2024_blog

## 题目：由数据最低位选择地址变换的存字

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `110100` | `base` | `rt` | `offset` |

## 描述

计算基址加符号偏移的 32 位地址。若 GPR[rt] 最低位为 0，则清除地址低两位后存字；否则将地址低 30 位末尾补两位 0 作为存字地址。两种情况均写入完整的 GPR[rt]。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
if GPR[rt]<sub>0</sub> = 0 then
    memory[vAddr<sub>31..2</sub> || 0<sup>2</sup>] ← GPR[rt]
else
    memory[vAddr<sub>29..0</sub> || 0<sup>2</sup>] ← GPR[rt]
endif
</pre>

## 其他

两个存字地址均按 4 字节对齐。GPR[rt] 为奇数时，地址变换丢弃 vAddr 的最高两位。寄存器值保持不变。
