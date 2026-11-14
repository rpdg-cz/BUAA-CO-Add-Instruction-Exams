# P6_crt_2024_blog — 题解

> 项目：P6 ｜ 指令：crt ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/12/02/CO/CO-p6-course/)

## 题解

> 一个单纯的 R 型指令，所以只需要改 ALU 即可。不过需要注意 verilog 的切片不支持不定长度，所以按 RTL 语言这样写 `rotate` 函数是不行的。正解应该这样：

```verilog
integer i;
reg [31:0] rst_rs;
always @ (*) begin
    rst_rs = A;
    for (i = 1; i <= 31; i = i + 1) begin
        rst_rs = rst_rs + {A[0], A[31:1]};
    end
    // rt 同理
end
```

> 另外注意比大小时用 `$signed()`。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
