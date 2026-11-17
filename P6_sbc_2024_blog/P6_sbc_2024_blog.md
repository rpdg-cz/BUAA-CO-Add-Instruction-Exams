# P6_sbc_2024_blog

## 题目：按每字节一的个数进行稳定排序

## 编码

| 31..0 |
| --- |
| xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |

## 描述

将GPR[rs]分成四个字节，以各字节中1的个数为排序键。GPR[rt]为奇数时，按从低字节到高字节的键值升序排列；为偶数时按该方向降序排列。相同键保持原有相对顺序，重排后的字写入GPR[rd]。

## 操作

<pre>
for i in 0 .. 3
    B[i] ← GPR[rs]<sub>8i+7..8i</sub>
    count[i] ← 0
    for j in 0 .. 7
        count[i] ← count[i] + B[i]<sub>j</sub>
    endfor
endfor
for i in 1 .. 3
    for j in 0 .. 3 - i
        swap ← false
        if GPR[rt]<sub>0</sub> = 1 and count[j] &gt; count[j+1] then
            swap ← true
        endif
        if GPR[rt]<sub>0</sub> = 0 and count[j] &lt; count[j+1] then
            swap ← true
        endif
        if swap then
            temp ← B[j]
            B[j] ← B[j+1]
            B[j+1] ← temp
            temp ← count[j]
            count[j] ← count[j+1]
            count[j+1] ← temp
        endif
    endfor
endfor
GPR[rd] ← B[3] || B[2] || B[1] || B[0]
</pre>

## 限制与异常

排序键为1的个数，不是字节值。相同键不交换。
