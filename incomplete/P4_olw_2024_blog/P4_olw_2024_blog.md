# P4_olw_2024_blog

## 题目：满足单调性条件才加载

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `base` | `rt` | `offset` |

## 格式

`olw rt, offset(base)`

## 描述

计算基址与符号扩展的 offset 末尾补两位 0 的和，读取相应内存字。读出数据满足单调不减条件时写入 GPR[rt]，否则保持 GPR[rt] 不变。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset || 0<sup>2</sup>)
memword ← memory[vAddr<sub>31..2</sub> || 0<sup>2</sup>]
</pre>
