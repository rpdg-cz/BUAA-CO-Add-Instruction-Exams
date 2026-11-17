# P5-P6_偶数位异或_blog

## 题目：偶数编号位异或

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

将GPR[rs]的偶数编号位与GPR[rt]的对应位异或，奇数编号位保持GPR[rs]的原值，结果写入GPR[rd]。位编号从最低位0开始。

## 操作

<pre>
GPR[rd] ← GPR[rs] xor (GPR[rt] and 0x55555555)
</pre>

## 限制与异常

GPR[rt]的奇数编号位不影响结果。
