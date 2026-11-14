# P4_L5_BNEZALC_2022

> 项目：P4 ｜ 题目 ID：986 ｜ 来源 PieId：1338 ｜ 类型：文件上传

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
                regimm<br/>
                000001
            </td>
        <td id="td-rs">rs</td>
        <td id="td-rt">
                BNEZALC<br/>
                10011
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
                    bnezalc rs, offset
                </p>
        </td>
      </tr>
      <tr>
        <td id="td-head">
                描述
            </td>
        <td colspan="4">
          <p id="p-text">
                    如果 GPR[rs]不等于0，则跳转到 label，并将 PC + 4 存入 31 号寄存器。
                </p>
        </td>
      </tr>
      <tr>
        <td id="td-head">
                操作
            </td>
        <td colspan="4">
          <p id="p-code">if (GPR[rs] ≠ 0) then</p>
          <p id="p-code" style="text-indent: 4em">PC &nbsp; ← &nbsp; PC + 4 + sign_extend(offset||0<sup>2</sup>)</p>
          <p id="p-code" style="text-indent: 4em">GPR[31] &nbsp; ← &nbsp; PC + 4</p>
          <p id="p-code">else</p>
          <p id="p-code" style="text-indent: 4em">PC &nbsp; ← &nbsp; PC + 4</p>
          <p id="p-code">endif</p>
        </td>
      </tr>
      <tr>
        <td id="td-head">
                示例
            </td>
        <td colspan="4">
          <p id="p-code">
                    bnezalc $t0, label
                </p>
        </td>
      </tr>
      <tr>
        <td id="td-head">
                其他
            </td>
        <td colspan="4">
          <p id="p-text">
                  不考虑延迟槽<br/>
                </p>
        </td>
      </tr>
    </table>

## 附件

- [bnezalc.class](bnezalc.class)
