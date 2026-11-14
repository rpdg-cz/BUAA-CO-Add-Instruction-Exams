# P4_L5_sbsam_2023

> 项目：P4 ｜ 题目 ID：1189 ｜ 来源 PieId：1338 ｜ 类型：文件上传

# SBSAM
## Store Byte Shift And Mask 
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
            SBSAM<br />
            111110
        </td>
        <td id="td-rs">base</td>
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
        <td colspan="4">
            <p id="p-code">
                sbsam rt, offset(base)
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            描述
        </td>
        <td colspan="4">
            <p id="p-code">
                将 GPR[rt] 中的数据循环左移 GPR[base] 次，以 offset 高 5 位为 32 位掩码中 1 的初始位置，GPR[base] 高 5 位为 32 位掩码中 1 的结束位置，将掩码与 GPR[rt] 中数据相与后写入内存中相应字节位置
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            操作
        </td>
        <td colspan="4">
            <p id="p-code">
                vaddr ← GPR[base] + sign_extend(offset)
            </p>
               <p id="p-code">
                byte ← vaddr<sub style="font-size: 65%">1..0</sub>
            </p>
            <p id="p-code">
                paddr ← vaddr<sub>31...2</sub> || 0<sup>2</sup></p>
                <p id="p-code">
                temp2 ← GPR[base]<sub>4...0</sub>
            </p>
            <p id="p-code">
                temp3 ← GPR[base]<sub>31...27</sub>
            </p>
             <p id="p-code">
                temp4 ←  offset<sub>15...11</sub>
            </p>
             <p id="p-code">if temp2 = 0 then</p>
             <p id="p-code" style="text-indent: 4em">temp1 ← GPR[rt]</p> 
            <p id="p-code">else</p>
            <p id="p-code" style="text-indent: 4em">temp1 ← GPR[rt]<sub>31-temp2...0</sub> || GPR[rt]<sub>31...32-temp2</sub></p> 
             <p id="p-code">endif</p>
            <p id="p-code">if temp3 >= temp4 then</p>
            <p id="p-code" style="text-indent: 4em">mask ← （0<sup>32-temp3</sup> || 1<sup>temp3-temp4</sup> || 0<sup>temp4</sup>）</p>
             <p id="p-code">else</p>
            <p id="p-code" style="text-indent: 4em">mask ← （1<sup>32-temp4</sup> || 0<sup>temp4-temp3</sup> || 1<sup>temp3</sup>）
            </p>
            <p id="p-code">endif</p>
            <p id="p-code">memword ← memory[paddr]
              </p>
            <p id="p-code">
               memword<sub>byte*8+7...byte*8 </sub> ← mask<sub>byte*8+7...byte*8 </sub> & temp1<sub>byte*8+7...byte*8 </sub>
            </p>
             <p id="p-code">
                   memory[paddr] ← memword
                </p> 
        </td>
    </tr>
    <tr>
        <td id="td-head">
            示例
        </td>
        <td colspan="4">
            <p id="p-code">
                sbsam $t0, 1($t1)
            </p>
        </td>
    </tr>
    <tr>
        <td id="td-head">
            其他
        </td>
        <td colspan="4">
            <p id="p-text">
                指令表现以 .class 指令扩展在 MARS 中的行为为准
            </p>
        </td>
    </tr>
</table>

## 附件

- [sbsam.class](sbsam.class)
