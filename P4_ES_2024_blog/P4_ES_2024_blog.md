# P4_ES_2024_blog

## 题目：减法溢出时分支，否则保存差值

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `101100` | `rs` | `rt` | `offset` |

## 描述

将 GPR[rs] 和 GPR[rt] 分别符号扩展为 33 位后相减。发生 32 位有符号减法溢出时进行相对分支；否则将差值低 32 位写入 GPR[rt]，并顺序执行。

## 操作

<pre>
temp ← (GPR[rs]<sub>31</sub> || GPR[rs]) − (GPR[rt]<sub>31</sub> || GPR[rt])
if temp<sub>32</sub> ≠ temp<sub>31</sub> then
    PC ← PC + 4 + sign_extend(offset || 0<sup>2</sup>)
else
    GPR[rt] ← temp<sub>31..0</sub>
endif
</pre>

## 其他

溢出时不写 GPR[rt]，执行分支而不产生算术溢出异常。
