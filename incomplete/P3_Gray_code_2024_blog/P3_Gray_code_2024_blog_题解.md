# P3_Gray_code_2024_blog — 题解

可将两位 Gray 转换做成独立组合单元。每组转换可写成：

<pre>
gray(x)<sub>1</sub> ← x<sub>1</sub>
gray(x)<sub>0</sub> ← x<sub>1</sub> xor x<sub>0</sub>
</pre>
