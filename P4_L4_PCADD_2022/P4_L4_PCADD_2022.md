# P4_L4_PCADD_2022

> 项目：P4 ｜ 题目 ID：966 ｜ 来源 PieId：1338 ｜ 类型：文件上传

<table style="border-collapse:collapse; width: 500pt;">
    <tr>
        <td id="td-head" rowspan="3">
            编码
        </td>
        <td id="td-opcode-top">
            <span style="float: left;">31</span>
            <span style="float: right;">26</span>
        </td>
        <td id="td-rs-top">
            <span style="float: left;">25</span>
            <span style="float: right;">21</span>
        </td>
        <td id="td-rt-top">
            <span style="float: left;">20</span>
            <span style="float: right;">16</span>
        </td>
        <td id="td-rd-top">
            <span style="float: left;">15</span>
            <span style="float: right;">11</span>
        </td>
        <td id="td-shamt-top">
            <span style="float: left;">10</span>
            <span style="float: right;">6</span>
        </td>
        <td id="td-func-top">
            <span style="float: left;">5</span>
            <span style="float: right;">0</span>
        </td>
    </tr>
    <tr>
        <td id="td-opcode">
            SPECIAL<br />
            000000
        </td>
        <td id="td-rs">rs
        <td id="td-rt">
            0<br />
            00000
        </td>
        <td id="td-rd">
            rd
        </td>
        <td id="td-shamt">
            0<br />
            00000
        </td>
        <td id="td-func">
            PCADD<br />110001
        </td>
    </tr>
    <tr>
        <td id="td-opcode-bottom">
            6
        </td>
        <td id="td-rs-bottom">
            5
        </td>
        <td id="td-rt-bottom">
            5
        </td>
        <td id="td-rd-bottom">
            5
        </td>
        <td id="td-shamt-bottom">
            5
        </td>
        <td id="td-func-bottom">
            6
        </td>
    </tr>
    <tr>
        <td id="td-head">
            格式
        </td>
        <td colspan="6">
            <p id="p-code">
                pcadd rd, rs
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">将 GPR[rs] 和 PC 的值相加的结果存入 GPR[rd]</p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            操作
        </td>
        <td colspan="6">
            <p id="p-code">GPR[rd] ← GPR[rs] + PC</p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="6">
            <p id="p-code">
                pcadd $t0, $t1
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            其他
        </td>
        <td colspan="6">
            <p id="p-text">
                指令表现以 .class 指令扩展在 MARS 中的行为为准
            </p>
        </td>
    </tr>
</table>

## 附件

- [pcadd.class](pcadd.class)
