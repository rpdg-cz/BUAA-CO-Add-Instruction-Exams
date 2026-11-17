# P5-P6_xore_blog

## 题目：xore（XOR Even Bits）

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | rs | rt | rd | xxxxx | xxxxxx |

## 格式

`xore rd, rs, rt`

## 描述

将GPR[rs]的偶数编号位与GPR[rt]的对应位异或，奇数编号位保持GPR[rs]的原值，结果写入GPR[rd]。位编号从最低位0开始。

## 操作

<pre>
GPR[rd] ← GPR[rs] xor (GPR[rt] and 0x55555555)
</pre>

## 限制与异常

GPR[rt]的奇数编号位不影响结果。
