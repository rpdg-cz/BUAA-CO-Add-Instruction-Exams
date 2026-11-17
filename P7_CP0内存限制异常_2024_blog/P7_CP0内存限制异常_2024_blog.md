# P7_CP0内存限制异常_2024_blog

## 题目：由CP0配置内存区间读写限制

## 描述

在CP0新增32位18号寄存器LowerLimit和19号寄存器UpperLimit，均支持全部32位mfc0/mtc0读写。两寄存器低16位零扩展后分别作为下界L与上界U，限制区间为[L,U)。两寄存器高16位中1的总数为奇数时，该区间只读；为偶数时只写。一次访问的任一字节落入区间即命中限制。

对每条访存，vAddr为其有效字节地址，n为访问字节数：lb/sb为1，lh/sh为2，lw/sw为4。StoreAccess、LoadAccess分别表示当前访问为存储、加载。

## 操作

<pre>
L ← zero_extend(CPR[0, 18, 0]<sub>15..0</sub>)
U ← zero_extend(CPR[0, 19, 0]<sub>15..0</sub>)
count ← 0
for i in 16 .. 31
    count ← count + CPR[0, 18, 0]<sub>i</sub> + CPR[0, 19, 0]<sub>i</sub>
endfor
hit ← false
for i in 0 .. n - 1
    if (0 || L) ≤ (0 || (vAddr + i)) and (0 || (vAddr + i)) &lt; (0 || U) then
        hit ← true
    endif
endfor
if hit and count mod 2 = 1 and StoreAccess then
    SignalException(AdES)
endif
if hit and count mod 2 = 0 and LoadAccess then
    SignalException(AdEL)
endif
</pre>

## 限制与异常

0≤L≤U≤0x3000。L=U时不限制读写。AdES的ExcCode为5，AdEL为4。原有越界、未对齐、地址加法溢出和设备访问限制仍适用。
