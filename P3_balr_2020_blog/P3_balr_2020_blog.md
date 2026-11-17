# P3_balr_2020_blog

## 题目：相对跳转并链接至指定寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `xxxxx` | `rt` | `imm` |

## 描述

以 PC + 4 为基址，加上立即数字段末尾补两位 0 后符号扩展的位移，无条件跳转，并将 PC + 4 写入 GPR[rt]。

## 操作

<pre>
target_offset ← sign_extend(imm || 0<sup>2</sup>)
GPR[rt] ← PC + 4
PC ← PC + 4 + target_offset
</pre>

## 其他

链接值使用跳转前的 PC。rt 为 0 时仍执行跳转。
