# P3_bgc_2024_blog

## 题目：bgc（Branch on Gray-code Comparison）

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| `xxxxxx` | `xxxxx` | `rt` | `offset` |

## 格式

`bgc rt, offset`

## 描述

将GPR[rt]的16个两位组分别转换为Gray码，累计各组转换结果高位中1的个数。若累计值大于rt字段的无符号编号，则按offset进行相对分支。两位Gray转换为00→00、01→01、10→11、11→10。

## 操作

<pre>
sum ← 0
for i in 0 .. 15
    x ← GPR[rt]<sub>2*i+1..2*i</sub>
    g<sub>1</sub> ← x<sub>1</sub>
    g<sub>0</sub> ← x<sub>1</sub> xor x<sub>0</sub>
    sum ← sum + g<sub>1</sub>
endfor
if sum &gt; rt then
    PC ← PC + 4 + sign_extend(offset || 0<sup>2</sup>)
endif
</pre>

## 补充条件

源数据取本指令执行前的GPR[rt]，按低位到高位分成16个两位组；每组作给定Gray转换后，低位对sum贡献0、高位为1时对sum贡献1，sum初值为0、范围为0至16。

比较右操作数为指令中5位rt字段的无符号编号，范围0至31；sum大于该编号时分支，小于或等于时顺序执行。不写任何通用寄存器。

offset为16位补码字偏移，目标为本指令PC+4+sign_extend(offset拼接00)；P3无延迟槽。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

本指令在单周期中完成，无延迟槽，不新增异常；普通顺序执行时PC增加4。

输入保证采用的分支目标位于已加载指令区；分支目标按32位地址回绕，offset为字偏移，故对齐保持不变。
