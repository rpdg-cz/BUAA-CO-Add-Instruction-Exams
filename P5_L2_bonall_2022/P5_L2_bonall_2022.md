# P5_L2_bonall_2022

> 项目：P5 ｜ 题目 ID：1046 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# Branch if Opposite Number and Link Likely 相反数时跳转并链接

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
            bonall
            <br />
            011001
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
                bonall rs, rt, offset
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">
                链接，在 GPR[rs] 与 GPR[rt] 互为相反数时跳转，跳转时执行延迟槽指令，否则清空延迟槽
            </p>
            <p id="p-code">
               （Hint：32'h8000_0000 与 32'h8000_0000 <b>不</b>互为相反数）
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
                target_offset ← sign_extend(offset||0<sup>2</sup>)
            </p>
            <p id="p-code" style="text-indent: 2em">
                Condition ← GPR[rs] + GPR[rt] = 0<sup>32</sup>
            </p>
            <p id="p-code" style="text-indent: 2em">
                GPR[31] ← PC + 8
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
                else
            </p>
            <p id="p-code" style="text-indent: 4em">
                NullifyCurrentInstruction()
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
                bonall $t0, $t1, label
            </p>
        </td>
    </tr>
</table>

## 附件

- [bonall.class](bonall.class)
