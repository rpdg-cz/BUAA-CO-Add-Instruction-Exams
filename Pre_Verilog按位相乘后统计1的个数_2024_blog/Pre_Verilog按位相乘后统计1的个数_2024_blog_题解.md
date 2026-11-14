# Pre_Verilog按位相乘后统计1的个数_2024_blog — 题解

> 项目：Pre ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/09/23/CO/BUAA-CO-pre/)

## 题解

> 由于是二进制，按位乘其实就是按位 and，之后用 for 循环统计结果中的 1，然后输出即可。

```verilog
module ans(
    input  [31:0] vector_a,
    input  [31:0] vector_b,
    output [5:0]  answer
);
    reg [31:0] temp;
    reg [5:0]  cnt;
    always @(*) begin
        cnt  = 0;
        temp = vector_a & vector_b;
        for (i = 0; i < 32; i = i + 1) begin
            if (temp[i] == 1) cnt = cnt + 1;
        end
    end
    assign answer = cnt;
endmodule
```

- 博客提醒的坑：`&` 是按位与（`&&` 是逻辑与、`and` 是门级原语）；Verilog 的整型变量要写 `integer` 而不是 `int`；`answer` 要么声明成 `reg`，要么另设临时 `reg cnt`；寄存器要初始化。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
