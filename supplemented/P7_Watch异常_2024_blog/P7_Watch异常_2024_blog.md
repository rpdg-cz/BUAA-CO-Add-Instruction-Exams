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
IMWatch ← not CPR[0, 12, 0]<sub>1</sub> and E<sub>0</sub> and E<sub>3</sub> and (PC = iAddr)
dataHit ← false
if LoadAccess or StoreAccess then
    for i in 0 .. n - 1
        if vAddr + i = dAddr then
            dataHit ← true
        endif
    endfor
endif
DMWatch ← false
if not CPR[0, 12, 0]<sub>1</sub> and E<sub>0</sub> and dataHit then
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

## 补充条件

WatchLo和WatchHi均在复位时为0，支持全部32位读写；WatchHi位4至31保留写入值但不参与判定。mtc0的配置从该指令成功提交后生效，不反过来改变该mtc0自身的Watch判定。

监视地址均为16位字段零扩展后的字节地址；IMWatch只比较当前指令PC是否恰等于iAddr，不比较整条指令覆盖的四个字节。DMWatch比较当前访存实际覆盖的全部字节，允许dAddr不对齐。

同一指令的同步异常优先级从高到低为：取指AdEL、IMWatch、RI、Syscall、Ov、取数AdEL或存数AdES、DMWatch。IMWatch和DMWatch的ExcCode均为23；取指AdEL不再解析该地址的指令。不同指令始终先处理程序顺序中较老者。

可响应外部中断优先于上述全部同步异常，ExcCode=0。SR的EXL=1时屏蔽Watch，不要求异常嵌套；输入保证处理程序不产生其他同步异常。

有效数据地址按课程进行16位符号字节偏移加法；load/store的地址加法溢出、对齐错误及映射错误为AdEL/AdES。合法范围为DM 0x0000..0x2fff、Timer0 0x7f00..0x7f0b、Timer1 0x7f10..0x7f1b、中断发生器0x7f20..0x7f23；Timer只允许整字访问，写Count寄存器为AdES。

每个覆盖地址vAddr+i以至少33位整数计算，不回绕到0；地址错误优先于DMWatch，故失败的访问不产生数据副作用。IMWatch即使命中访存地址错误指令，也按较高优先级报告23。

Watch受害指令及所有年轻指令不得留下GPR、CP0、HI/LO、DM或外设副作用；受害乘除指令不得启动乘除，也不能修改忙状态，早于受害指令的乘除可正常完成。

获准中断或异常统一将SR的EXL置为1、进入0x4180；受害指令非延迟槽时EPC=该指令PC且BD=0，延迟槽时EPC=该指令PC−4且BD=1，普通分支无论是否跳转都标记其延迟槽，eret无延迟槽。

GPR、PC、Watch寄存器均为32位；配置与访存数据按程序顺序取得，前序mtc0必须转发或等待。普通顺序PC增加4；控制转移不放在另一控制转移的延迟槽中。
