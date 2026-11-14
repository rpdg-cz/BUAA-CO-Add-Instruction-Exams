# P5_L4_addei_2022

> 项目：P5 ｜ 题目 ID：1048 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# Add Extended Immediate 不支持溢出的有符号加高位 1 扩展立即数

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
            addei
            <br />
            110011
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
                addei rt, rs, offset
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">
                对立即数进行高位 1 扩展，并与 GPR[rs] 相加，如果未溢出，则将相加得到的结果写入 GPR[rt]；如果发生了溢出，则将高位 1 扩展后的立即数写入 GPR[rt]
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            操作
        </td>
        <td colspan="6">
            <p id="p-code">
                temp ←  (one_extend(offset)<sub>31</sub> || one_extend(offset)<sub>31...0</sub>) + (GPR[rs]<sub>31</sub>
                || GPR[rs]<sub>31...0</sub>)
            </p>
            <p id="p-code">
                if temp<sub>32</sub> != temp<sub>31</sub>
            </p>
            <p id="p-code" style="text-indent: 2em">
                GPR[rt] ← one_extend(offset)
            </p>
            <p id="p-code">
                else
            </p>
            <p id="p-code" style="text-indent: 2em">
                GPR[rt] ← temp
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="4">
            <p id="p-code">
                addei $t0, $t1, 1
            </p>
        </td>
    </tr>
</table>

## 附件

- [addei.class](addei.class)
