# P3_wsbh_2020_blog

## 题目：半字内字节交换

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| `xxxxxx` | `xxxxx` | `rt` | `rd` | `xxxxx` | `xxxxxx` |

## 描述

分别交换 GPR[rt] 高半字和低半字内的两个字节，将结果写入 GPR[rd]。两个半字的位置保持不变。

## 操作

<pre>
GPR[rd] ← GPR[rt]<sub>23..16</sub> || GPR[rt]<sub>31..24</sub> || GPR[rt]<sub>7..0</sub> || GPR[rt]<sub>15..8</sub>
</pre>

## 其他

源值为 0xAABBCCDD 时，结果为 0xBBAADDCC。rd 与 rt 相同时，按修改前的源值完成交换。
