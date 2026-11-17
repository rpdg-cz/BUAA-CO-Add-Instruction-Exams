# P5_cmco_2020_blog

## 题目：统计最长连续一位段长度

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

求 GPR[rs] 的 32 位二进制表示中最长连续 1 位段的长度，将结果写入 GPR[rd]。最高位和最低位不环绕连接。

## 操作

<pre>
longest ← 0
count ← 0
for i in 0 .. 31
    if GPR[rs]<sub>i</sub> = 1 then
        count ← count + 1
        if count &gt; longest then
            longest ← count
        endif
    else
        count ← 0
    endif
endfor
GPR[rd] ← zero_extend(longest)
</pre>

## 其他

全零返回 0，全一返回 32。最高位与最低位为 1 而中间为 0 时，属于两个独立位段。
