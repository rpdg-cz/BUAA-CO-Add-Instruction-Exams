# P5_ae_2024_blog — 题解

高 16 位等于立即数与其低 15 位末尾补 0 后的按位异或。可并行计算相邻位异或，再与立即数拼接。

<pre>
upper ← imm xor (imm<sub>14..0</sub> || 0)
GPR[rs] ← upper || imm
</pre>
