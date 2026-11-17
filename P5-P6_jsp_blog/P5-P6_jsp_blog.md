# P5-P6_jsp_blog

## 题目：jsp（Jump and Stack Push）

## 编码

| 31..26 | 25..0 |
| --- | --- |
| xxxxxx | imm26 |

## 格式

`jsp imm26`

## 描述

以旧GPR[29]为地址，将本指令PC+8写入一个内存字；再将GPR[29]减4。执行延迟槽后，跳转到PC高四位、26位立即数和两个零拼接形成的地址。

## 操作

<pre>
I:
    vAddr ← GPR[29]
    memory[vAddr] ← PC + 8
    GPR[29] ← GPR[29] - 4
    target ← PC<sub>31..28</sub> || imm26 || 0<sup>2</sup>
I+1:
    PC ← target
</pre>

## 限制与异常

存储使用减4前的栈指针。写回GPR[29]，GPR[31]保持不变。
