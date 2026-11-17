# P6_lpx_2024_blog

## 题目：加载后按低五位的最大质数选择目的寄存器

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | xxxxx | offset |

## 描述

由GPR[base]加符号扩展offset得到地址，向下对齐到32位字后加载，取加载字低五位为x。求不大于x的最大质数p，将加载字写入GPR[p]。

## 操作

<pre>
temp ← GPR[base] + sign_extend(offset)
vAddr ← temp<sub>31..0</sub>
pAddr ← vAddr<sub>31..2</sub> || 0<sup>2</sup>
memword ← memory[pAddr]
x ← memword<sub>4..0</sub>
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

offset为16位补码字节偏移；地址相加取低32位，再清零低两位。输入保证对齐后的字地址在0x0000至0x2ffc；允许未对齐的原有效地址。

x只取加载字低5位，不与任何寄存器异或；x为0或1时不写任何寄存器，其余情况写不大于x的最大质数编号。

位20..16不参与计算且忽略。x=2时目的为2，x=31时目的为31；写回数据始终为完整32位加载字。

GPR和PC均为32位；寄存器源均取本指令执行前、满足程序顺序的数据。GPR[0]恒为0，对其写入被忽略。除专门声明的宽位临时量外，写入32位寄存器或地址时取低32位。

流水线转发、暂停应保证与按程序顺序执行等价。普通顺序执行时PC增加4；控制转移的延迟槽内不放置另一条控制转移指令。本题不新增P7异常机制。

循环下界大于上界时执行0次；例如q=2时内层整除检查为空，2仍为质数。
