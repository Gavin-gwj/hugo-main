---
date: 2025-05-14T13:20:57+08:00
draft: true
title: 实体-联系模型 (Entity-Relationship Model) 学习笔记
categories:
  - 笔记
  - E-R图
description: E-R图
---

# E-R图学习笔记
---

## 1. 概述

实体-联系模型 (E-R模型) 是一种用于数据库设计的概念模型，它提供了一种描述数据结构的高层视图，独立于任何特定的数据库管理系统 (DBMS)。E-R模型使用实体、属性和联系来表示现实世界中的数据及其相互关系。

**主要目标：**

* 清晰地表示数据需求。
* 为后续的数据库逻辑设计提供基础。
* 促进数据库设计者和用户之间的沟通。

## 2. 基本概念

### 2.1 实体 (Entity)

* **定义：** 现实世界中可以区分的、独立存在的“事物”或“对象”。例如：学生、课程、教师、部门等。
* **表示：** 通常用**矩形框**表示，框内写明实体的名称。
    ```markdown
    +----------+
    |   学生   |
    +----------+
    ```

### 2.2 属性 (Attribute)

* **定义：** 描述实体特征的性质。例如：学生的学号、姓名、年龄；课程的课程号、课程名、学分等。
* **表示：** 通常用**椭圆**表示，并用**直线**连接到所属的实体。属性名写在椭圆内。
    ```markdown
        +----------+
        |   学生   |
        +----------+
           /   |   \
          /    |    \
      +-------+ +-------+ +-------+
      | 学号  | | 姓名  | | 年龄  |
      +-------+ +-------+ +-------+
    ```
* **属性类型：**
    * **简单属性 (Simple Attribute)：** 不能再分解为更小部分的属性，如年龄。
    * **复合属性 (Composite Attribute)：** 可以分解为更小部分的属性，如地址 (可以分解为省、市、街道等)。
    * **多值属性 (Multivalued Attribute)：** 对于一个实体实例可以有多个值的属性，如一个学生可以有多个兴趣爱好。通常用**双层椭圆**表示。
        ```markdown
            +----------+
            |   学生   |
            +----------+
                 |
            +----------+
            | 兴趣爱好 |
            +----------+
        ```
    * **派生属性 (Derived Attribute)：** 其值可以从其他属性计算得到的属性，如学生的年龄可以从出生日期计算得到。通常用**虚线椭圆**表示。
        ```markdown
            +----------+
            |   学生   |
            +----------+
                 |
            +----------+
            |   年龄   | (派生)
            +----------+
        ```
* **主键 (Primary Key)：** 唯一标识一个实体实例的一个或一组属性。通常在属性名下方加**下划线**表示。一个实体只能有一个主键。
    ```markdown
        +----------+
        |   学生   |
        +----------+
           /   |   \
          /    |    \
      +--------+ +-------+ +-------+
      | 学号   | | 姓名  | | 年龄  |
      +--------+ +-------+ +-------+
        -------
    ```
* **候选键 (Candidate Key)：** 可以唯一标识一个实体实例的一个或一组属性。一个实体可以有多个候选键，但只能选择一个作为主键。

### 2.3 联系 (Relationship)

* **定义：** 实体之间的关联或相互作用。例如：学生**选修**课程，教师**教授**课程，部门**拥有**员工等。
* **表示：** 通常用**菱形框**表示，框内写明联系的名称，并用**直线**连接到相关的实体。
    ```markdown
        +----------+        +----------+
        |   学生   |--------|  选修  |--------|   课程   |
        +----------+        +----------+        +----------+
    ```

### 2.4 联系的度 (Cardinality)

* 描述参与联系的实体实例之间的数量关系，也称为**基数比率**。常见的基数比率有：
    * **一对一 (1:1)：** 实体集A中的每个实体最多与实体集B中的一个实体相关联，反之亦然。
        ```markdown
        +-----+     1:1     +-----+
        |  A  |-------------|  B  |
        +-----+             +-----+
        ```
    * **一对多 (1:N)：** 实体集A中的每个实体可以与实体集B中的零个或多个实体相关联，但实体集B中的每个实体最多与实体集A中的一个实体相关联。
        ```markdown
        +-----+     1:N     +-----+
        |  A  |-------------|  B  |
        +-----+             +-----+
        ```
    * **多对多 (M:N)：** 实体集A中的每个实体可以与实体集B中的零个或多个实体相关联，并且实体集B中的每个实体也可以与实体集A中的零个或多个实体相关联。
        ```markdown
        +-----+     M:N     +-----+
        |  A  |-------------|  B  |
        +-----+             +-----+
        ```
* **表示方法：** 将基数比率标注在连接联系和实体的直线上。通常在靠近实体的一侧标注该实体参与联系的最小和最大实例数。例如：
    * `1:1`
    * `1:N` 或 `(0,N)` 或 `(1,N)`
    * `M:N` 或 `(0,M, 0,N)` 或 `(1,M, 1,N)`

### 2.5 联系的属性

* 联系本身也可以拥有属性，这些属性描述了实体之间联系的特征。例如，学生选修课程的联系可以有“选修日期”和“成绩”等属性。
* **表示：** 联系的属性用**椭圆**表示，并用**虚线**连接到所属的联系菱形框。
    ```markdown
        +----------+        +----------+        +----------+
        |   学生   |--------|  选修  |--------|   课程   |
        +----------+        +----------+        +----------+
                               |
                           +----------+
                           |  成绩  |
                           +----------+
    ```
* **注意：** 只有在多对多联系中，联系才通常拥有自己的属性。在一对一或一对多联系中，联系的属性通常可以转移到参与联系的某个实体中。

### 2.6 弱实体 (Weak Entity)

* **定义：** 依赖于另一个实体 (称为强实体或标识实体) 而存在的实体，自身没有主键。弱实体通过与强实体的联系以及自身的局部键来唯一标识。
* **表示：** 用**双层矩形框**表示。
* **标识性联系 (Identifying Relationship)：** 弱实体与强实体之间的联系，用于标识弱实体实例。用**双层菱形框**表示。
    ```markdown
        +------------+      +--------------------+      +----------+
        ||  家属  ||------||  属于 (标识性)  ||------|   员工   |
        +------------+      +--------------------+      +----------+
           /   |   \
          /    |    \
      +-------+ +-------+
      | 姓名  | | 关系  |
      +-------+ +-------+
        ------- (局部键)
    ```
    在上面的例子中，“家属”是弱实体，它依赖于“员工”实体存在，自身的“姓名”不足以唯一标识一个家属，需要结合其所属的员工才能唯一确定。

## 3. E-R图的绘制步骤

1.  **识别实体：** 从需求描述中找出所有重要的名词，它们通常代表实体。
2.  **识别属性：** 为每个实体确定其相关的特征属性。确定主键、候选键、复合属性、多值属性和派生属性。
3.  **识别联系：** 找出实体之间的动词或动词短语，它们通常代表实体之间的联系。
4.  **确定联系的类型和基数比率：** 分析每个联系所涉及的实体数量关系 (一对一、一对多、多对多)。
5.  **为联系添加属性 (如果需要)：** 如果联系本身具有需要记录的信息，则为其添加属性。
6.  **绘制E-R图：** 使用标准的E-R图符号将实体、属性和联系连接起来。
7.  **完善E-R图：** 检查E-R图是否准确、完整地反映了数据需求。考虑是否存在冗余或不清晰的地方。

## 4. E-R模型的优点

* 简单直观，易于理解和沟通。
* 独立于具体的数据库实现。
* 为数据库设计提供了一个清晰的概念框架。
* 有助于发现和解决数据设计中的问题。

## 5. E-R模型的局限性

* 对于复杂的约束和规则，E-R模型可能难以清晰表达。
* 缺乏形式化的定义，可能存在二义性。
* 不直接支持数据操作的描述。

## 6. 总结

E-R模型是数据库设计的重要工具，通过实体、属性和联系的概念，能够有效地描述现实世界的数据及其关系。掌握E-R模型的基本概念和绘制方法，对于进行良好的数据库设计至关重要。在实际应用中，通常会使用专门的建模工具来辅助E-R图的绘制和管理。