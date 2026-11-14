# P6_wtd_2024_blog — 题解

> 项目：P6 ｜ 指令：wtd ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/12/16/BUAA-CO-P6习题分析/)

## 题解

- 在 **D 级**用组合逻辑算出 `rs_sum`、`rt_sum`，比较后决定回写值，故 `Tuse_RS=0`、`Tuse_RT=0`、`Tnew_DEin=1`：

```verilog
module cauculate(   // 计算一个数的循环移位和（不考虑溢出）
    input  wire [31:0] A,
    output wire [31:0] B
);
    reg [31:0] ans;
    reg [31:0] temp;
    integer i;
    always @(*) begin
        ans = 32'b0;
        temp = A;
        for (i = 0; i < 32; i = i + 1) begin
            temp = {temp[0], temp[31:1]};
            ans = ans + temp;
        end
    end
endmodule

writeBack_DEin = (isWtd_DEin == 1 && (rs_sum > rt_sum)) ? 32'b1 :
                 (isWtd_DEin == 1 && (rs_sum < rt_sum)) ? (32'b0 - 32'b1) :
                 (isWtd_DEin == 1 && (rs_sum == rt_sum)) ? 32'b0 : ...;
```

- 控制信号：`RegWrite=1`，`RegDst=2'b01`（写 `rd`）。
- 别忘了在 E/M 级透传回写数据，"避免被覆盖"：`writeBack_EMin = (isWtd_DEout == 1 || ...) ? writeBack_DEout : ...;`

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
