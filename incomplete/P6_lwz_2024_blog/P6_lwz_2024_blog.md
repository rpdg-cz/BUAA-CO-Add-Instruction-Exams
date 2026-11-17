# P6_lwz_2024_blog

## 题目：加载后按异或低五位的最大质数选择目的寄存器

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

按lw方式加载一个32位字，将其低五位与旧GPR[rt]的低五位异或得到x。求不大于x的最大质数p，将加载字写入GPR[p]。

## 操作

以下列出x≥2时的目的编号选择与写回。

<pre>
vAddr ← GPR[base] + sign_extend(offset)
memword ← memory[vAddr]
x ← memword<sub>4..0</sub> xor GPR[rt]<sub>4..0</sub>
p ← 2
for q in 2 .. x
    prime ← true
    for d in 2 .. q - 1
        if q mod d = 0 then
            prime ← false
        endif
    endfor
    if prime then
        p ← q
    endif
endfor
GPR[p] ← memword
</pre>

## 限制与异常

质数范围为2、3、5、7、11、13、17、19、23、29、31；写回值为整个加载字。
