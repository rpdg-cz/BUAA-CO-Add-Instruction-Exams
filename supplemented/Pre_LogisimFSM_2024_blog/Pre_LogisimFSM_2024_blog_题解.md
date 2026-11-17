# Pre_LogisimFSM_2024_blog — 题解

## 解题思路

使用两个 32 位寄存器 A、S，复位都置 0。组合逻辑先由 type 选择 nextA：0、A+1、S、A；然后令 nextS=S+nextA。同步复位在寄存器 D 输入端优先选择两个零值，不使用异步 clear 替代。

两个寄存器必须同沿从旧 A、旧 S 更新；不能把 nextA 在 type=2 时写成 S+A，因为 S 已含当前 A。type=0 时 nextS=S，type=3 时 nextS=S+A。溢出仅保留低 32 位。

复位后 type 依次为 1、1、2、0、2、3、2，沿后 (A,S) 依次为 (1,1)、(2,3)、(3,6)、(0,6)、(6,12)、(6,18)、(18,36)。这同时验证零项不清历史、保持项仍累加。若 A=0xFFFFFFFF 且 type=1，则 nextA=0，nextS 保留原 S；无符号回绕符合模加法。
