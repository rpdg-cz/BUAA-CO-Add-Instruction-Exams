# P7_withdraw_2024_blog — 题解

> 项目：P7 ｜ 指令：withdraw ｜ 年份：2024 ｜ 来源：[kie-chi](https://kie-chi.com/2024/12/08/CO_P7/)、[UHO](https://theuho.site/2024/12/11/COexamP7/)

## 题解

博客给出的实现思路（原文，逐字摘录并合行）：

> 一道相当繁琐的指令题
>
> 首先将四个寄存器加入CP0
>
> CP0中设置一个符号位flag，标识是否已经有sw指令了
>
> 在CP0中多加一层ExcCode的判断

```verilog
//withdraw时判断是否有ExcCodePlus
assign newExcCode = (ExcCode != 5'b0) ? ExcCode :
                    (ExcCodePlus != 5'b0) ? ExcCodePlus :
                    5'b0;
```

> 建议传入ByteEn，通过是否位 `4'b1111` 来判断是否为sw
>
> 遇到withdraw指令判断逻辑较为复杂

```verilog
//withdraw是外界传入的信号，标识withdraw指令
if (withdraw & flag)
begin
    if (Addr < DomainLo || Addr >= DomainHi)
    begin
        ExcCodePlus = `EXC_AdES;
    end
    if (!Req)
    begin
        outByteEn = 4'b1111;
        outAddr = ChangeAddr;
        outData = ChangeData;
    end
end
```

> 然后在M级把这些输出值接到DM即可

```verilog
assign m_data_byteen = (withdraw) ? outByteEn : ....;
assign m_data_addr   ...
assign m_data_wdata  ...
```

> 最后这条指令不需要转发和暂停，课程组还算有点人性，要我当助教我就这样(doge)

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
