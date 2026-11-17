# P3_Gray_code_2024_blog

## 题目：格雷码转换与条件分支

## 编码

| 31..0 |
| --- |
| `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 描述

两位格雷码转换将 00、01、10、11 分别映射为 00、01、11、10。指令使用分段转换结果进行统计，并根据比较结果进行相对分支。

## 操作

<pre>
gray(00) ← 00
gray(01) ← 01
gray(10) ← 11
gray(11) ← 10
</pre>
