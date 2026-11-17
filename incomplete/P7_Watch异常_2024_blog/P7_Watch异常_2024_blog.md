# P7_Watch异常_2024_blog

## 题目：指令地址与数据地址监视异常

## 描述

在CP0新增32位18号WatchLo和19号WatchHi，均支持全部32位mfc0/mtc0读写。WatchLo高16位零扩展得到指令监视地址iAddr，低16位零扩展得到数据监视地址dAddr。WatchHi的位0为全局使能，位1为store使能，位2为load使能，位3为PC使能。

PC监视命中产生IMWatch，数据访问覆盖dAddr且对应监视使能打开时产生DMWatch；两者ExcCode均为23。对每条访存，vAddr为有效字节地址，n为字节数：lb/sb为1，lh/sh为2，lw/sw为4。StoreAccess、LoadAccess分别表示当前访问为存储、加载。

## 操作

<pre>
iAddr ← zero_extend(CPR[0, 18, 0]<sub>31..16</sub>)
dAddr ← zero_extend(CPR[0, 18, 0]<sub>15..0</sub>)
E ← CPR[0, 19, 0]
IMWatch ← E<sub>0</sub> and E<sub>3</sub> and (PC = iAddr)
dataHit ← false
if LoadAccess or StoreAccess then
    for i in 0 .. n - 1
        if vAddr + i = dAddr then
            dataHit ← true
        endif
    endfor
endif
DMWatch ← false
if E<sub>0</sub> and dataHit then
    if StoreAccess and E<sub>1</sub> then
        DMWatch ← true
    endif
    if LoadAccess and E<sub>2</sub> then
        DMWatch ← true
    endif
endif
</pre>

## 限制与异常

dAddr不要求字或半字对齐。PC未对齐或越界的AdEL优先于IMWatch。受害指令在延迟槽时，EPC记录其前一条跳转指令地址。受害乘除指令不应启动乘除操作，也不改变HI、LO。
