# P1_numberNest数字匹配合法性判定_2023_blog — 题解

> 项目：P1 ｜ 年份：2023 ｜ 来源：[fysszlr](https://www.fysszlr.top/2023/10/16/CO-P1%E4%B8%8A%E6%9C%BA%E8%AE%B0%E5%BD%95/)

## 题解

法一（状态机）：题目限制数字最多到 5，按此列出状态机。

法二（两个 if，博主采用）：用 `state` 表示当前正在匹配的数字（如 123 的 state 为 3，122 的 state 为 1，空串为 0）。合法输入只有两种：

- `in == state + 1`：开始下一个匹配，`state <= state + 1`；
- `in == state`：结束当前匹配，`state <= state - 1`。

其余输入均判为不合理：`check <= 1; state <= 0;`。

```verilog
reg [2:0] state;
always @ (posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        check <= 0;
        state <= 0;
    end
    else begin
        if (in == state + 1) begin
            check <= 0;
            state <= state + 1;
        end
        else if (in == state) begin
            check <= 0;
            state <= state - 1;
        end
        else begin
            check <= 1;
            state <= 0;
        end
    end
end
```

优点：代码短、对数据范围依赖小，可拓展性好。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
