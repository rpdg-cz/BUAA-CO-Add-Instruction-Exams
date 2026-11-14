# P6_sbc_2024_blog — 题解

> 项目：P6 ｜ 指令：sbc ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 属"运算 + 判断 + 回写（地址确定，写 `rd`）"，可在 D 级组合逻辑里一次算完：先拆四个字节、各自数 1，再按 `rt` 的奇偶做稳定排序后拼接。

```verilog
module sort(
    input  wire [31:0] A,
    input  wire        way,   // way == 1 升序排列 (1数量多的在高位)
    output wire [31:0] B
);
    reg [7:0] A[4];  reg [4:0] Num[4];
    ...
    B1 = {A[3], A[2], A[1], A[0]};   // 升序（冒泡，稳定）
    B2 = {A[3], A[2], A[1], A[0]};   // 降序
    assign B = (way == 1) ? B1 : B2;
endmodule
```

- 排序用稳定的冒泡：只有 `Num[j] < Num[j-1]`（升序）或 `>`（降序）时才交换，相等不动，从而保持稳定。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
