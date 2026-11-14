# 加指令练习

## 在 BUAA CO Toolkit 中使用 TS 脚本

需要 **VS Code 1.101 或更新版本**，以及已包含 JS/TS 自定义指令功能的 [BUAA CO Toolkit](https://github.com/stone926/BUAA-CO-Toolkit)。脚本由插件调用 VS Code 自带的运行时加载，无需额外安装 Node、npm 包、`tsc` 或 MARS。

1. 在 VS Code 中打开待测 CPU 的工作区，选择与 CPU 对应的课程 Profile。
2. 选择一道练习，将目录中的 `<指令名>.ts` 复制到 CPU 工作区的 `.co/custom-instructions/`。
3. 保存 ASM，使用插件的运行、机器码导出、用户 ASM 对拍或随机测试功能。

例如练习 `P5_L3_blztal_2022` 的放置方式为：

```text
CPU 工作区/
├── .co/
│   └── custom-instructions/
│       └── blztal.ts
├── mips.v
└── test.asm
```

脚本中的 `import type ... from '@buaa-co/instructions'` 只用于编辑器类型检查，加载时会被擦除。**直接复制脚本即可运行**。如需编辑器补全和类型提示，可先运行 **CO: 创建 JS/TS 自定义指令**，选择 TypeScript 并填写所选指令名，再用本仓库的同名 `.ts` 覆盖生成的示例；保留该命令创建的 `co-instructions.d.ts` 和 `tsconfig.json`。

### 运行、导出与对拍

- ASM 运行和机器码导出使用已加载脚本的编码及语义。
- **CO: 测试用户汇编文件或目录** 接受单个 ASM 或目录；目录只测试直属的 `.asm`、`.s`、`.mips` 文件，不递归。选择自动参考引擎即可使用 TS 定义。
- CPU 对拍用的程序应以标准停机自环及随后的 `nop` 结束，例如：

  ```asm
  halt:
      beq $0, $0, halt
      nop
  ```

- 脚本带有随机生成配方。在 `co.test.instructions` 中加入助记符可选择测试重点；配置留空时，支持当前模式的自定义指令会加入默认生成集合。测试 CPU 必须实现所选指令及测试前导需要的课程基础指令。
- 测试用例会保存定义快照。修改 `.ts` 后请创建新测试；旧用例重跑仍使用原定义。

P3、P4 按课程不启用延迟槽，P5～P7 按课程启用。脚本声明了普通 MARS 和 P3～P7 模式，便于跨阶段验证；题目所属阶段仍以目录和题面为准。测试 P6/P7 CPU 时应选择实际 CPU 阶段。P7 的异常、中断、Timer、MMIO 和返回黑盒测试继续由插件现有链路处理。

## 使用原始 `.class` 附件

有附件的题目可将 `.class` 加载到支持自定义指令的课程魔改 MARS。具体加载方法取决于所用 MARS 版本。

在 BUAA CO Toolkit 中使用这条参考路径时，将所需 `.class` 放到原 ASM 工作区的 `.co/custom-instructions/`，并配置：

```json
{
  "co.toolchain.mars": "D:/Tools/Mars/Mars.jar"
}
```

需要可用的 Java；不在 PATH 时另设 `co.toolchain.java`。普通官方 MARS 不一定提供所需的扩展加载功能。

用户 ASM 对拍可以显式选择自定义 MARS 参考。自动模式在没有 JS/TS 定义绑定且遇到未知指令时，可切换到完整的 MARS 参考。已绑定 TS 定义的程序不会把部分指令交给 `.class` 混合执行。比较两种实现时，请分别运行并明确所选参考；尤其注意下方 BOMEZ 的已知错误。

## 已知错误、差异与注意事项

### BOMEZ：两份原始附件都有取模方向错误

涉及 [P4 2022 题目](P4_L2_BOMEZ_2022/P4_L2_BOMEZ_2022.md) 和 [P3 2023 题目](P3_L15_bomez_2023/P3_L15_bomez_2023.md)。2022 题面已提示其 `.class` 有误；2023 的附件与它**字节完全相同**，SHA-256 为：

```text
4cc38f179c862cccdf6010974da731af7a31a1a6a18408d3f9c15213ed02b8d1
```

按逻辑汇编操作数，题意使用 `popcount(rs) % popcount(rt)`，两个原始附件实际使用 `popcount(rt) % popcount(rs)`。本仓库两个 `bomez.ts` 均按题意实现；两个原始 `.class` 作为历史附件保留，未修改。

当两个 popcount 都非零且不对称时，两种参考的跳转结果可能不同。不要把这种已知参考差异直接归因于 CPU 错误。验证已为每个年份设置 4 组明确的差异断言。

### BOMEZ / BONALL：编码图与附件的源寄存器排列不同

两个 BOMEZ 附件及 [BONALL 附件](P5_L2_bonall_2022/bonall.class) 的两个源寄存器字段，与题面编码图的排列相反。TS 脚本保留经过附件验证的实际机器码排列，即 `rt:5 rs:5`，回调字段按逻辑汇编操作数命名。

汇编结果与附件逐字比较，不通过事后改写机器码掩盖差异。设计 CPU 译码时，应同时核对实际汇编结果与题面，不要仅根据编码图推断字段顺序。

### 同名和编码冲突的练习需要分开加载

不同题目可能复用助记符或机器码。例如：

- `addei` 与 `lhogez` 使用相同主操作码 `110011`。
- `bonall` 与 `lwer` 使用相同主操作码 `011001`。
- 不同年份的 `bomez`、`lboez`、`pcadd` 保留独立目录。

每次只复制当前题目所需的定义；不要把本仓库全部 TS 脚本或全部 `.class` 一起放进加载目录。

### 没有附件的题目

- [SB](P4_L8_SB_2022/P4_L8_SB_2022.md) 是标准字节存储练习，没有附带 `.class`；TS 脚本可用，参考验证使用原生 MARS 的 SB。
- [LWER](P5_M_lwer_2022/P5_M_lwer_2022.md) 没有附带 `.class`；TS 实现按题意验证，未伪造 Java 附件。它会强制按字对齐地址，并根据内存和旧目标寄存器值选择偶数目的寄存器，包括零寄存器。

### 保留题目特有的边界语义

- ADDM 按原附件先进行 32 位加法回绕，再进行有符号比较，不使用无限精度整数加法替代。
- RLB 的题目输入范围为立即数 `0..31`。
- ADDEI 将立即数高位补 1；表示原始位 `0xffff` 时可使用 `-1`，避免不同汇编器对十进制 `65535` 的范围检查差异。
- BLZTAL 的分支位移会受寄存器值影响；BONALL 不跳转时取消延迟槽，但仍写链接寄存器；LHOGEZ 可能改写 `$31 = PC + 4`。实现时需按各自题意处理。

脚本含潜在读写、随机生成与课程冒险时机声明。冒险覆盖来自课程模型，并非对实际 CPU 内部流水线的测量。若自定义定义覆盖了测试前导、处理程序或停机代码所需基础指令的编码，插件会报告具体冲突；可以用用户 ASM 构造相应测试。

## 题目索引

<!-- Exercise table generated from the verified fixture index. -->

| 练习 | 阶段 | TS 脚本 | 原始附件 |
| --- | --- | --- | --- |
| [P3_L10_addm_2023](P3_L10_addm_2023/P3_L10_addm_2023.md) | P3 | [addm.ts](P3_L10_addm_2023/addm.ts) | [addm.class](P3_L10_addm_2023/addm.class) |
| [P3_L12_lsh_2023](P3_L12_lsh_2023/P3_L12_lsh_2023.md) | P3 | [lsh.ts](P3_L12_lsh_2023/lsh.ts) | [lsh.class](P3_L12_lsh_2023/lsh.class) |
| [P3_L15_bomez_2023](P3_L15_bomez_2023/P3_L15_bomez_2023.md) | P3 | [bomez.ts](P3_L15_bomez_2023/bomez.ts) | [bomez.class](P3_L15_bomez_2023/bomez.class) |
| [P3_L16_lboez_2023](P3_L16_lboez_2023/P3_L16_lboez_2023.md) | P3 | [lboez.ts](P3_L16_lboez_2023/lboez.ts) | [lboez.class](P3_L16_lboez_2023/lboez.class) |
| [P4_L1_RLB_2022](P4_L1_RLB_2022/P4_L1_RLB_2022.md) | P4 | [rlb.ts](P4_L1_RLB_2022/rlb.ts) | [rlb.class](P4_L1_RLB_2022/rlb.class) |
| [P4_L2_BOMEZ_2022](P4_L2_BOMEZ_2022/P4_L2_BOMEZ_2022.md) | P4 | [bomez.ts](P4_L2_BOMEZ_2022/bomez.ts) | [bomez.class](P4_L2_BOMEZ_2022/bomez.class) |
| [P4_L3_LWRR_2022](P4_L3_LWRR_2022/P4_L3_LWRR_2022.md) | P4 | [lwrr.ts](P4_L3_LWRR_2022/lwrr.ts) | [lwrr.class](P4_L3_LWRR_2022/lwrr.class) |
| [P4_L4_PCADD_2022](P4_L4_PCADD_2022/P4_L4_PCADD_2022.md) | P4 | [pcadd.ts](P4_L4_PCADD_2022/pcadd.ts) | [pcadd.class](P4_L4_PCADD_2022/pcadd.class) |
| [P4_L4_SSZE_2022](P4_L4_SSZE_2022/P4_L4_SSZE_2022.md) | P4 | [ssze.ts](P4_L4_SSZE_2022/ssze.ts) | [ssze.class](P4_L4_SSZE_2022/ssze.class) |
| [P4_L5_BNEZALC_2022](P4_L5_BNEZALC_2022/P4_L5_BNEZALC_2022.md) | P4 | [bnezalc.ts](P4_L5_BNEZALC_2022/bnezalc.ts) | [bnezalc.class](P4_L5_BNEZALC_2022/bnezalc.class) |
| [P4_L5_sbsam_2023](P4_L5_sbsam_2023/P4_L5_sbsam_2023.md) | P4 | [sbsam.ts](P4_L5_sbsam_2023/sbsam.ts) | [sbsam.class](P4_L5_sbsam_2023/sbsam.class) |
| [P4_L6_LBOEZ_2022](P4_L6_LBOEZ_2022/P4_L6_LBOEZ_2022.md) | P4 | [lboez.ts](P4_L6_LBOEZ_2022/lboez.ts) | [lboez.class](P4_L6_LBOEZ_2022/lboez.class) |
| [P4_L7_TFTC_2022](P4_L7_TFTC_2022/P4_L7_TFTC_2022.md) | P4 | [tftc.ts](P4_L7_TFTC_2022/tftc.ts) | [tftc.class](P4_L7_TFTC_2022/tftc.class) |
| [P4_L8_SB_2022](P4_L8_SB_2022/P4_L8_SB_2022.md) | P4 | [sb.ts](P4_L8_SB_2022/sb.ts) | 无 |
| [P4_L9_BAO_2022](P4_L9_BAO_2022/P4_L9_BAO_2022.md) | P4 | [bao.ts](P4_L9_BAO_2022/bao.ts) | [bao.class](P4_L9_BAO_2022/bao.class) |
| [P4_L9_ras_2023](P4_L9_ras_2023/P4_L9_ras_2023.md) | P4 | [ras.ts](P4_L9_ras_2023/ras.ts) | [ras.class](P4_L9_ras_2023/ras.class) |
| [P4_L10_pcadd_2023](P4_L10_pcadd_2023/P4_L10_pcadd_2023.md) | P4 | [pcadd.ts](P4_L10_pcadd_2023/pcadd.ts) | [pcadd.class](P4_L10_pcadd_2023/pcadd.class) |
| [P5_L2_bonall_2022](P5_L2_bonall_2022/P5_L2_bonall_2022.md) | P5 | [bonall.ts](P5_L2_bonall_2022/bonall.ts) | [bonall.class](P5_L2_bonall_2022/bonall.class) |
| [P5_L3_blztal_2022](P5_L3_blztal_2022/P5_L3_blztal_2022.md) | P5 | [blztal.ts](P5_L3_blztal_2022/blztal.ts) | [blztal.class](P5_L3_blztal_2022/blztal.class) |
| [P5_L4_addei_2022](P5_L4_addei_2022/P5_L4_addei_2022.md) | P5 | [addei.ts](P5_L4_addei_2022/addei.ts) | [addei.class](P5_L4_addei_2022/addei.class) |
| [P5_L5_lhogez_2022](P5_L5_lhogez_2022/P5_L5_lhogez_2022.md) | P5 | [lhogez.ts](P5_L5_lhogez_2022/lhogez.ts) | [lhogez.class](P5_L5_lhogez_2022/lhogez.class) |
| [P5_L6_lbget_2022](P5_L6_lbget_2022/P5_L6_lbget_2022.md) | P5 | [lbget.ts](P5_L6_lbget_2022/lbget.ts) | [lbget.class](P5_L6_lbget_2022/lbget.class) |
| [P5_M_lwer_2022](P5_M_lwer_2022/P5_M_lwer_2022.md) | P5 | [lwer.ts](P5_M_lwer_2022/lwer.ts) | 无 |


## 博客来源题目（`*_blog`）

以下题目整理自往届博客，来源链接写在每份题面的「出处」小节。

- 目录命名：加指令题 `P?_<指令名>_<年份>_blog`；非加指令题 `P?_<内容概述>_<年份>_blog`；年份无法确定的省略。
- **不提供 TS 脚本与 `.class` 附件**：博客只留下题面/回忆，没有课程组原始附件；请按题面自行设计 CPU 改动。
- 同一题的题解另存为同目录 `<目录名>_题解.md`（有则存在）。
