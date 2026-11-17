# P6_lwz_2024_blog

## 题目：加载后按异或低五位的最大质数选择目的寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | rt | offset |

## 描述

按lw方式加载一个32位字，将其低五位与旧GPR[rt]的低五位异或得到x。求不大于x的最大质数p，将加载字写入GPR[p]。

## 操作

<pre>
temp ← GPR[base] + sign_extend(offset)
vAddr ← temp<sub>31..0</sub>
memword ← memory[vAddr]
x ← memword<sub>4..0</sub> xor GPR[rt]<sub>4..0</sub>
if x ≥ 2 then
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
endif
</pre>

## 限制与异常

质数范围为2、3、5、7、11、13、17、19、23、29、31；写回值为整个加载字。

## 补充条件

offset为16位补码字节偏移，地址加法取低32位；输入保证有效地址字对齐且在0x0000至0x2ffc。

x为加载字低5位与执行前旧GPR[rt]低5位异或，按0至31的无符号编号处理。x为0或1时不写任何寄存器，x≥2时写不大于x的最大质数编号。

rt是实际读源而非固定写回目的；写回值为加载的整个32位字，只有计算得到的质数目的会被写入。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

流水线转发、暂停应保证与按程序顺序执行等价。普通顺序执行时PC增加4；控制转移的延迟槽内不放置另一条控制转移指令。本题不新增P7异常机制。

循环下界大于上界时执行0次；例如q=2时内层整除检查为空，2仍为质数。
