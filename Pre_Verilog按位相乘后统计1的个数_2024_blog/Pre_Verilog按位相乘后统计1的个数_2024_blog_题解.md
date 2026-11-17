# Pre_Verilog按位相乘后统计1的个数_2024_blog — 题解

## 解题思路

二进制一位相乘等价于按位 and。先得到两个向量的逐位乘积 p，再统计 p 中 1 的数量。

<pre>p ← vector_a and vector_b
answer ← 0
for i in 0 .. 31
    if p<sub>i</sub> = 1 then
        answer ← answer + 1
    endif
endfor</pre>

Verilog 按位与使用 `&`；`&&` 仅产生一个逻辑结果。组合 always 块中先将 6 位计数变量清零，再用 integer 循环变量遍历 32 位，以阻塞赋值累计。

## 自查

任一输入全 0 时答案为 0；两者全 1 时为 32；互补向量的逐位乘积全 0。
