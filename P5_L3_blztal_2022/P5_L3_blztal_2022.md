# P5_L3_blztal_2022

> 项目：P5 ｜ 题目 ID：1047 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# Branch if Less Than Zero by Times and Link 小于零时按倍数跳转并链接

<table style="border-collapse:collapse; width: 500pt;">
    <tr>
        <td id="td-head" rowspan="3">
            编码
        </td>
        <td id="td-opcode-top">
            <span style="float: left;">
                31
            </span>
            <span style="float: right;">
                26
            </span>
        </td>
        <td id="td-rs-top">
            <span style="float: left;">
                25
            </span>
            <span style="float: right;">
                21
            </span>
        </td>
        <td id="td-rt-top">
            <span style="float: left;">
                20
            </span>
            <span style="float: right;">
                16
            </span>
        </td>
        <td id="td-imm-top">
            <span style="float: left;">
                15
            </span>
            <span style="float: right;">
                0
            </span>
        </td>
    </tr>
    <tr>
        <td id="td-opcode">
            blztal
            <br />
            100111
        </td>
        <td id="td-rs">
            rs
        </td>
        <td id="td-rt">
            rt
        </td>
        <td id="td-imm">
            offset
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
        <td id="td-imm-bottom">
            16
        </td>
    </tr>
    <tr>
        <td id="td-head">
            格式
        </td>
        <td colspan="6">
            <p id="p-code">
                blztal rs, rt, offset
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">
                当 GPR[rs] 小于 0 时，从 PC+4 的基础上跳转到立即数乘 2<sup>GPR[rt]<sub>1...0</sub></sup> 条指令之后，如果需要跳转，则也需要链接；如果不需要跳转，则不需要链接（详细以操作为准）。
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            操作
        </td>
        <td colspan="6">
            <p id="p-code">
                I:
            </p>
            <p id="p-code" style="text-indent: 2em">
                target_offset ← sign_extend(offset||0<sup>(2+GPR[rt]<sub>1...0</sub>)</sup>)
            </p>
            <p id="p-code" style="text-indent: 2em">
                Condition ← GPR[rs] &lt; 0
            </p>
            <p id="p-code" style="text-indent: 2em">
                If condition then
            </p>
            <p id="p-code" style="text-indent: 4em">
                GPR[31] ← PC + 8
            </p>
            <p id="p-code" style="text-indent: 2em">
                endif
            </p>
            <p id="p-code">
                I+1:
            </p>
            <p id="p-code" style="text-indent: 2em">
                If condition then
            </p>
            <p id="p-code" style="text-indent: 4em">
                PC ← PC + target_offset
            </p>
            <p id="p-code" style="text-indent: 2em">
                endif
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="4">
            <p id="p-code">
                blztal $t0, $t1, 1
            </p>
        </td>
    </tr>
</table>

## 附件

- [blztal.class](blztal.class)
