# P4_L6_LBOEZ_2022

> 项目：P4 ｜ 题目 ID：987 ｜ 来源 PieId：1338 ｜ 类型：文件上传

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
                LBOEZ<br/>
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
                    lboez rt, offset(base)
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                描述
            </td>
      <td colspan="4">
        <p id="p-code">
            Addr &nbsp; ← &nbsp; GPR[base] + sign_extend(offset)，若memory[Addr]的对应<strong>字节</strong>数据的二进制1的个数等于0的个数，则将该<strong>字节</strong>符号扩展存入GPR[rt]，否则将0存入GPR[rt]。
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                操作
            </td>
      <td colspan="4">
      <p id="p-code">
                    vaddr ←  GPR[base] + sign_extend(offset)
                </p>
                 <p id="p-code">paddr ← vaddr<sub>31...2</sub> || 0<sup>2</sup></p>
        <p id="p-code">
                    memword ← Memory[paddr]
                </p>
        <p id="p-code">
          byte ← vaddr<sub style="font-size: 65%">1..0</sub>
        <p id="p-code">
            temp ← memword<sub style="font-size: 65%">7+8*byte</sub> + memword<sub style="font-size: 65%">7+8*byte-1</sub> + ... + memword<sub style="font-size: 65%">8*byte</sub>
                </p>
        <p id="p-code">
                    if temp = 4 then
                </p>
        <p id="p-code" style="text-indent: 4em">
                    GPR[rt] &nbsp; ← &nbsp; sign_extend(memword<sub style="font-size: 65%">7+8*byte..8*byte</sub>)
                </p>
        <p id="p-code">
                    else
                </p>
        <p id="p-code" style="text-indent: 4em">
                    GPR[rt] &nbsp; ← &nbsp; 0
                </p>
        <p id="p-code">
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
                    lboez $t0, 1($t1)
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                其他
            </td>
      <td colspan="4">
        <p id="p-text">
          注意：需要取出字中相应的字节，而非对整个字进行操作。
        </p>
      </td>
    </tr>
  </table>

## 附件

- [lboez.class](lboez.class)
