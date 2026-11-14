# P5_L5_lhogez_2022

> 项目：P5 ｜ 题目 ID：1049 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# Load Halfword if Ones Greater Than or Equal to Zeros 1 的个数大于等于 0 的个数时存储半字

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
            lhogez<br />
            110011
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
                lhogez rt, offset(base)
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="6">
            <p id="p-code">
                由 GPR[base] + sign_extend(offset) 计算出有效地址，并在内存中取出该地址对应的 16 位半字，如果该半字中 1 的个数不少于 0 的个数，则将该半字符号扩展后存入 rt 寄存器；否则，将 PC+4 存入 31 号寄存器
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
            <p id="p-code">bit ← vAddr<sub>1</sub></p>
            <p id="p-code">def:</p>
            <p id="p-code" style="text-indent: 2em">countOne(x): x 中 1 的个数</p>
            <p id="p-code" style="text-indent: 2em">countZero(x): x 中 0 的个数</p>
            <p id="p-code">memHalf ← memword<sub>15+16*bit ..16*bit</sub></p>
            <p id="p-code">Condition ← countZero(memHalf) ≤ countOne(memHalf) </p>
            <p id="p-code">if Condition:</p>
            <p id="p-code" style="text-indent: 2em">GPR[rt] ← sign_extend(memHalf)</p>
            <p id="p-code">else:</p>
            <p id="p-code" style="text-indent: 2em">GPR[31] ← PC + 4</p>
            <p id="p-code">end if</p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="4">
            <p id="p-code">
                lhogez $t5, 8($s1)
            </p>
        </td>
    </tr>
    <tr>
        </td>
    </tr>
</table>

## 附件

- [lhogez.class](lhogez.class)
