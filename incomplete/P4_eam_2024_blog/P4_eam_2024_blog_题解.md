# P4_eam_2024_blog — 题解

求取非负余数时，应使用补码解释的低 16 位。若实现语言的余数对负数保留负号，可先求余，再加 17 后再次求余。高位补 1 需要填满全部高 16 位。

<pre>
r ← ((temp mod 17) + 17) mod 17
zero_result ← 0<sup>16</sup> || r<sub>15..0</sub>
one_result ← 1<sup>16</sup> || r<sub>15..0</sub>
</pre>
