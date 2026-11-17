# P3_lbi_2020_blog

## 题目：按地址选择字节并原位写回

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

计算基址加符号偏移的有效地址，读取其所在的内存字。地址低两位选定一个字节，将该字节写入 GPR[rt] 的相同字节位置，保留其余三字节。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr<sub>31..2</sub> || 0<sup>2</sup>]
byte ← vAddr<sub>1..0</sub>
GPR[rt]<sub>7+8*byte..8*byte</sub> ← memword<sub>7+8*byte..8*byte</sub>
</pre>

## 其他

地址低两位为 0、1、2、3 时，分别覆盖 GPR[rt] 的第 0、1、2、3 字节。所读字节保持 8 位，不进行符号扩展。
