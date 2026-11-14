# P5_M_lwer_2022

> 项目：P5 ｜ 题目 ID：1060 ｜ 来源 PieId：1338 ｜ 类型：文件上传

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
                lwer<br/>
                011001
            </td>
      <td id="td-rs">base</td>
      <td id="td-rt">
                rt<br/>
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
                    lwer rt, offset(base)
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                描述
            </td>
      <td colspan="6">
        <p id="p-code">
                    从内存中取一个字，存到一个偶数号寄存器中
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                操作
            </td>
      <td colspan="6">
        <p id="p-code">addr ← GPR[base]+sign_ext(offset)</p>
        <p id="p-code">memword ← Memory[addr[31:2]||0<sup>2</sup>]</p>
        <p id="p-code">GPR[(memword+GPR[rt]) & 0x1e] = memword</p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                示例
            </td>
      <td colspan="4">
        <p id="p-code">
                    lwer $t5, 8($s1)
                </p>
      </td>
    </tr>
    <tr>
      <td id="td-head">
                其他
            </td>
      <td colspan="4">
        <p id="p-text">
                    地址不是4的倍数时强制对齐
                </p>
      </td>
    </tr>
  </table>
