# P7_lww_2024_blog

## 题目：比较撤销记录数据后的条件加载

## 编码

| 31..26 | 25..21 | 20..16 | 15..0 |
| --- | --- | --- | --- |
| xxxxxx | base | rt | offset |

## 格式

`lww rt, offset(base)`

## 描述

按lw读取整字W，取ChangeData为C。W大于C时执行一次撤销；W小于C时将W写GPR[rt]；相等时，将C写入由C低五位与rt字段异或得到编号的寄存器。三条路径以无符号关系互斥选择。

## 撤销状态

撤销状态由下表定义，均为32位。操作中用CPR[0, 编号, 0]访问表中寄存器。

| 名称 | CP0编号 | mfc0 | mtc0 | 复位值 |
| --- | --- | --- | --- | --- |
| DomainLo | 18 | 读全部32位 | 写全部32位 | 0x00000000 |
| DomainHi | 19 | 读全部32位 | 写全部32位 | 0x00003000 |
| ChangeAddr | 20 | 读全部32位 | 忽略写入 | 0x00000000 |
| ChangeData | 21 | 读全部32位 | 忽略写入 | 0x00000000 |

另有内部一位hasSW，复位为false，不能由mfc0/mtc0访问。DomainLo、DomainHi写入值保证字对齐并处于0x0000至0x3000，且每次写入后DomainLo≤DomainHi。域是无符号半开区间[DomainLo, DomainHi)，上下界相等时为空域。

只有成功提交、有效地址在0x0000至0x2ffc的普通sw建立历史：先将该地址原有整字与地址原子记录，再完成sw，并置hasSW为true。后续符合条件的sw覆盖唯一历史；sb、sh、对外设的sw、withdraw和lww自身均不更新历史，也不清除历史。sw即使写入值与旧字相同也记录。

成功撤销将hasSW清为false，ChangeAddr和ChangeData保留最近记录值；连续撤销只有第一次有效。没有历史时直接无操作，不作域检查；域检查失败时产生AdES，保留历史。异常、中断和eret均不自动清除或切换历史；处理程序内的普通DM sw同样会覆盖历史。域寄存器修改不改历史，只影响此后撤销的检查。

## 操作

temp为33位有符号和，sign_extend(offset)在此扩展到33位。LoadAddressError(vAddr)当且仅当有效字节地址未字对齐，或整字不在补充条件列出的合法数据地址范围。

<pre>
temp ← (GPR[base]<sub>31</sub> || GPR[base]) + sign_extend(offset)
vAddr ← temp<sub>31..0</sub>
if temp<sub>32</sub> ≠ temp<sub>31</sub> or LoadAddressError(vAddr) then
    SignalException(AdEL)
else
    W ← memory[vAddr]
    C ← CPR[0, 21, 0]
    if (0 || W) &gt; (0 || C) then
        if hasSW then
            if (0 || CPR[0, 20, 0]) &lt; (0 || CPR[0, 18, 0]) or (0 || CPR[0, 20, 0]) ≥ (0 || CPR[0, 19, 0]) then
                SignalException(AdES)
            else
                memory[CPR[0, 20, 0]] ← CPR[0, 21, 0]
                hasSW ← false
            endif
        endif
    else
        if (0 || W) &lt; (0 || C) then
            GPR[rt] ← W
        else
            D ← C<sub>4..0</sub> xor rt
            GPR[D] ← C
        endif
    endif
endif
</pre>

## 补充条件

W与C均按32位无符号数比较。C为程序顺序中ChangeData的当前值，即使hasSW=false也使用其保留值；复位后C=0。

offset为16位补码字节偏移。按普通lw作符号地址加法及整字读取；地址加法有符号溢出、非字对齐或不属于DM/Timer0/Timer1/中断发生器范围时为AdEL（ExcCode=4），不先清零低两位。

数据地址范围为0x0000..0x2fff、0x7f00..0x7f0b、0x7f10..0x7f1b、0x7f20..0x7f23；整字读取须完整落在对应范围。中断发生器读取返回0，计时器按当时寄存器值读取。

相等路径的rt为5位字段编号，不读取GPR[rt]；D为5位异或结果，D=0时忽略写回。小于路径写rt字段指定的寄存器。大于路径不进行普通加载写回，仅按完整撤销规则执行。

撤销状态、CP0编号/权限/复位、半开域、消费历史和非DM sw处理均按本题撤销状态表；lww自身不建立新sw历史。加载地址异常优先于撤销域异常，先保证成功读取W再选择比较路径。

GPR、PC及本题CP0寄存器均为32位，源值取本指令执行前的程序顺序状态；GPR[0]恒为0，对其写回被忽略。普通顺序PC增加4；普通分支和跳转保留一条延迟槽，eret无延迟槽，控制转移不放在另一条控制转移的延迟槽中。

按程序顺序处理异常和副作用。在宏观PC边界，满足SR的IE=1、EXL=0且至少一个HWInt与SR的IM对应位同为1的外部中断优先于所有同步异常，ExcCode=0。获准异常或中断统一将SR的EXL置为1并跳至0x4180；受害指令不在延迟槽时EPC记录其PC且BD=0，在延迟槽时EPC记录其PC−4且BD=1，不论前一分支是否跳转。较老指令正常完成；受害及年轻指令不得留下GPR、本题CP0、DM、外设或撤销历史副作用。课程MDU特例保留：已改变的受害MDU状态无需回滚，尚未改变状态的年轻MDU指令不得启动或写HI/LO。输入保证异常处理程序不再产生异常，不要求嵌套处理。

所有新增CP0读写、sw记录和撤销提交保持程序顺序。较早mtc0对后续域检查生效，较早sw的历史对后续撤销生效；流水线可暂停或转发，不能读取陈旧配置。

取指PC未字对齐或不在0x3000至0x6ffc时产生取指AdEL，优先于本指令的加载地址或撤销域异常。
