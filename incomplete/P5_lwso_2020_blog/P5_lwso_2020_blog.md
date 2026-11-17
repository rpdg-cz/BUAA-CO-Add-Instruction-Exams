# P5_lwso_2020_blog

## 题目：加载后无溢出才累加至链接寄存器

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

读取 GPR[rs] 加 offset 地址的内存字，与 GPR[31] 作 32 位有符号加法。无溢出时将和写入 GPR[31]；溢出时保持 GPR[31] 不变。

## 操作

<pre>
mem_data ← memory[GPR[rs] + offset]
temp ← (GPR[31]<sub>31</sub> || GPR[31]) + (mem_data<sub>31</sub> || mem_data)
if temp<sub>32</sub> = temp<sub>31</sub> then
    GPR[31] ← temp<sub>31..0</sub>
endif
</pre>
