# P7_withdraw_2024_blog

## 题目：撤销最近一次字存储

## 编码

| 31..26 | 25..21 | 20..16 | 15..11 | 10..6 | 5..0 |
| --- | --- | --- | --- | --- | --- |
| xxxxxx | xxxxx | xxxxx | xxxxx | xxxxx | xxxxxx |

## 描述

CP0中包含DomainLo、DomainHi、ChangeAddr、ChangeData四个寄存器。ChangeAddr保存最近一次成功sw的地址，ChangeData保存该sw修改前的整字值；DomainLo、DomainHi分别给出允许撤销地址的下界、上界。mfc0可读四个寄存器，mtc0仅可写DomainLo、DomainHi。

withdraw在已有sw历史且地址满足域限制时，将ChangeData作为一个字写回ChangeAddr，撤销该次sw。没有sw历史时不产生作用。地址低于下界或超过上界时产生AdES异常，ExcCode=5。

## 操作

### sw 成功提交时

<pre>
ChangeAddr ← vAddr
ChangeData ← memory[vAddr]
memory[vAddr] ← GPR[rt]
</pre>

### 满足撤销域限制且已有 sw 历史时

<pre>
memory[ChangeAddr] ← ChangeData
</pre>

## 限制与异常

DomainLo、DomainHi在0x0000到0x3000范围内且字对齐。撤销写入整字。异常受害指令及更年轻指令不改变内存或撤销记录。
