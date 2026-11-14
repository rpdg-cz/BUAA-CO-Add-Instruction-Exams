# P6_LoadPrimeXor_2024_blog — 题解

> 项目：P6 ｜ 指令：LoadPrimeXor ｜ 年份：2024 ｜ 来源：[owpeter](https://owpeter.github.io/2024/12/02/CO/CO-p6-course/)

## 题解

> 这题卡了我好久，虽然倒数第四分钟的时候交了一发过了，但是出来之后依然不明白怎么过的。几个点需要注意：
> - `s_prime` 的实现其实就是打表（反正我是打表，这样最稳妥可靠）
> - `paddr` 其实不需要特殊处理，因为这一步其实在课程组的 tb 里已经帮你处理过了。只需要确保自己读的是 word 即可
> - 阻塞与转发。条件 Load 类型最难搞的就是这玩意。
> - 阻塞不能采用无脑阻塞，必须仅阻塞质数，否则会 TLE。另外，由于写地址在 M 级就已经出来了，因此我在 M 级并没有阻塞。经检验，这样不会 run less cycle。
>
> 那么我卡哪了呢？似乎是转发。之前我的转发一直是这样的：

```verilog
assign D_FW_rs_Op = (D_rs != 0 && D_rs == E_GPRWaddr && E_GPRWaddr != 0) ? `DFWeback :
                    (D_rs != 0 && D_rs == M_GPRWaddr && M_GPRWaddr != 0) ? `DFWmback :
                    `DFWdefault;
```

> 但是课上会出现类似 `@00003048: $13 <= xxxxxxxx` 的报错。把所有 `==` 改成 `===` 就不会出现此问题了。

> 题解为博客作者原文或整理，仅供参考，不代表唯一解法。
