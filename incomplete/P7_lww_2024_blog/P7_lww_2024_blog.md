# P7_lww_2024_blog

## 题目：比较撤销记录数据后的条件加载

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 格式

`lww rt, offset(base)`

## 描述

从GPR[base]+offset指定地址所对应的字中加载W，读取ChangeData为C。W大于C时执行withdraw撤销；W小于C时将W写GPR[rt]；相等时，将C写入由C低五位与rt字段异或得到编号的寄存器。

CP0中包含ChangeAddr、ChangeData、DomainLo、DomainHi四个寄存器。ChangeAddr保存最近一次sw的地址，ChangeData保存该sw修改前的整字值；DomainLo、DomainHi给出撤销地址的上下界。withdraw在已有sw历史且地址满足域限制时，将ChangeData整字写回ChangeAddr，没有sw历史时不产生作用。

## 操作

<pre>
if W = ChangeData then
    temp ← ChangeData<sub>4..0</sub> xor rt
    GPR[temp] ← ChangeData
endif
</pre>

## 限制与异常

rt参与编号计算时表示五位寄存器编号。目的编号为0时寄存器组不变。W大于C的分支执行撤销写，不进行普通加载回写。
