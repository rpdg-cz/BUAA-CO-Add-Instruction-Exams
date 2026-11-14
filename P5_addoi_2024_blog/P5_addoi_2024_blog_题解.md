# P5_addoi_2024_blog — 题解

> 项目：P5 ｜ 指令：addoi ｜ 年份：2024 ｜ 来源：[jiangshiyi](https://jiangshiyi0822.github.io/2024/11/25/BUAA-CO-P5习题分析/)

## 题解

- 视为 `addi` 的变体，`ALU` 先算 `GRF[rs] + sign_ext(imm16)`，再取相反数并转成原码：

```verilog
module origin(  // 计算 A_in 的原码
    input  [31:0] A_in;
    output [31:0] A_out;
);
    reg [31:0] hold;
    reg [31:0] temp;
    integer i;
    always @(*) begin
        if (A_in > 32'h0) hold = A_in;
        else if (A_in < 32'h0) begin
            temp = A_in - 32'h1;
            for (i = 0; i < 31; i = i + 1) hold[i] = !temp[i];  // 除符号位取反
            hold[31] = 1;
        end
        else hold = 32'h0;
    end
    assign A_out = hold;
endmodule

wire [31:0] addoi_neg = 32'h0 - ALU_ans;   // 相反数
assign WriteBack_EMin = (isAddoi) ? addoi_ans : ...;  // 32位原码
```

- 控制信号：`RegWrite = 1`，`ALUSrc = 1`（用立即数）；`EXTOp` 需传特判信号做符号扩展（"默认拓展是 0 拓展，要进行符号拓展需要将新增指令的特判信号传入 EXTOp"）。
- 冒险：`Tuse_RS = 1`（E 级用 rs，经 ALU，故 wait 1 拍）、`Tuse_RT = maxTuse`（用不到 rt）、`Tnew_DEin = 2`（E 级产生新数据）。
- 回写地址确定（`rt`），无需特殊转发处理；但仍要在 E/M 级透传 `WriteBack`。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
