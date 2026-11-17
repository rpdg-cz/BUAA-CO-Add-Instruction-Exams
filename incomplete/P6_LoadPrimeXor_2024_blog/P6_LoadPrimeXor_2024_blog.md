# P6_LoadPrimeXor_2024_blog

## 题目：加载后按低五位的最大质数选择目的寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | xxxxx | offset |

## 描述

由GPR[base]加符号扩展offset得到地址，向下对齐到32位字后加载，取加载字低五位为x。求不大于x的最大质数p，将加载字写入GPR[p]。

## 操作

以下列出x≥2时的目的编号选择与写回。

<pre>
vAddr ← GPR[base] + sign_extend(offset)
pAddr ← vAddr<sub>31..2</sub> || 0<sup>2</sup>
memword ← memory[pAddr]
x ← memword<sub>4..0</sub>
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
