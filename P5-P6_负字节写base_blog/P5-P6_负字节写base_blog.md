# P5-P6_负字节写base_blog

## 题目：按符号选择目的寄存器的字节加载

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

从GPR[base]加符号扩展offset得到的地址读取一个字节，将字节符号扩展到32位。结果为负时写入GPR[base]，否则写入GPR[rt]。

## 操作

<pre>
vAddr ← GPR[base] + sign_extend(offset)
byte ← memory[vAddr]
temp ← sign_extend(byte<sub>7..0</sub>)
if temp &lt; 0 then
    GPR[base] ← temp
else
    GPR[rt] ← temp
endif
</pre>

## 限制与异常

零属于写GPR[rt]的分支。地址使用旧GPR[base]计算。
