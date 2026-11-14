# P5_L6_lbget_2022

> 项目：P5 ｜ 题目 ID：1050 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# Load Byte if Greater Than or Equal to Zero 大于等于 0 时存储字节

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
        <td id="td-imm-top">
            <span style="float: left;">15</span>
            <span style="float: right;">0</span>
        </td>
    </tr>
    <tr>
        <td id="td-opcode">
            lbget<br />
            110101
        </td>
        <td id="td-rs">base</td>
        <td id="td-rt">
            rt<br />
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
                lbget rt, offset(base)
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">
                GPR[rt] ← memory[GPR[base] + offset] if memory[GPR[base] + offset] &gt;= 0
            </p>
            <p id="p-code">
                GPR[base] ← memory[GPR[base] + offset] if memory[GPR[base] + offset] &lt; 0
            </p>
            <p id="p-code">
                由GPR[base] +
                sign_extend(offset) 计算出有效地址，并在内存中取出该地址对应的 8 位字节数据，如果该数大于或等于 0，则符号扩展为 32 位后存入编号为 rt 的寄存器；如果小于 0，则符号扩展为 32 位后存入编号为 base 的寄存器
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            操作
        </td>
        <td colspan="6">
            <p id="p-code">vAddr ← sign_extend(offset) + GPR[base]</p>
            <p id="p-code">pAddr ← vAddr<sub>31...2</sub> || 0<sup>2</sup></p>
            <p id="p-code">memword ← memory[pAddr]</p>
            <p id="p-code">byte ← vAddr<sub>1...0</sub></p>
            <p id="p-code">Condition ← memword<sub>7+8*byte</sub> = 0</p>
            <p id="p-code">if Condition:</p>
            <p id="p-code" style="text-indent: 2em">GPR[rt] ← sign_extend(memword<sub>7+8*byte..8*byte</sub>)</p>
            <p id="p-code">else:</p>
            <p id="p-code" style="text-indent: 2em">GPR[base] ← sign_extend(memword<sub>7+8*byte..8*byte</sub>)</p>
            <p id="p-code">end if</p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="4">
            <p id="p-code">
                lbget $t5, 8($s1)
            </p>
        </td>
    </tr>
    <tr>
        </td>
    </tr>
</table>

## 附件

- [lbget.class](lbget.class)
