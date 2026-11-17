# Pre_字符自动机_2021_blog — 题解

## 解题思路

保存已匹配前缀长度 p=0～5（空、c、cs、csc、csco、cscor），当前连续完整词数 cur，以及历史最大 best。按 cscore 的前缀自动机逐字符更新 p；正确跟进当前前缀时保持 cur，完成整个词时 p=0、next_cur=min(cur+1,255)、next_best=max(best,next_cur)。从完成词后的 p=0 读到 c 可以开始紧邻下一个词，此时不清 cur。

若当前字符不是当前 p 所期待的字符，则原连续段被打断，先令 cur=0，再从“旧前缀+当前字符”的最长有效后缀恢复 p。恢复表可由 KMP 前缀法构造；本模式在 csc+s 时回到 cs，在 cs+c 时到 csc，在任意无可用后缀时回到空。成功匹配整词没有非空真前后缀，故 p 回 0。

best 必须比较本次 next_cur，不能在非阻塞更新 cur 后仍比较旧 cur。cscorecscore 在第 6、12 字符后 best 分别为 1、2；再输入空格，best 保持 2。cscscscore 最后能匹配一个词，但前面的失配不会增加次数。cscorecsc 后的部分词不增加 best；随后出现 s 打断本段并保留 cs，后续完成的新词从 1 计。连续 256 个完整词输出 255。
