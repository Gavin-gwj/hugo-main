---
date: 2025-05-14T15:36:34+08:00
draft: true
title: Spring Boot 简单的增删改查功能的实现
categories:
  - 笔记
  - Java
  - Springboot
  - MyBatis
tags:
  - 笔记
  - springboot
  - Java
  - MyBatis
description: MyBatis 风格
image: Pasted-image-20250514161354.png
---

# Spring Boot 三层架构 CRUD 与前后端联调笔记 (MyBatis 风格 Mapper)
---

![Spring Boot CRUD 截图](./images/)
## 1. 核心概念：三层架构

在典型的 Web 应用中，我们将后端逻辑划分为三个主要层次：

* **Controller (控制层/表现层):**
    * **职责:** 接收前端发送的 HTTP 请求，对请求参数进行初步校验和转换。
    * 调用 Service 层处理业务逻辑。
    * 将 Service 层返回的结果封装成 HTTP 响应（通常是 JSON 格式）返回给前端。
    * 直接与外界（如浏览器、App 或其他服务）打交道。

* **Service (服务层/业务逻辑层):**
    * **职责:** 实现核心业务逻辑。
    * 组合调用一个或多个 Mapper/Repository 层的方法来完成复杂的业务操作。
    * 处理事务管理。
    * 不直接与 HTTP 请求或数据库打交道，而是作为 Controller 和 Mapper 之间的桥梁。

* **Mapper (数据访问层/持久层):**
    * **职责:** 与数据库进行直接交互，执行 SQL 语句（在此示例中，我们使用 MyBatis 风格的注解）。
    * 提供原子性的数据操作方法（增、删、改、查）。

**数据流向 (请求):** 前端 -> Controller -> Service -> Mapper -> 数据库
**数据流向 (响应):** 数据库 -> Mapper -> Service -> Controller -> 前端

## 2. 技术栈简介

* **Spring Boot:** 用于快速搭建和运行 Java 应用。
* **Maven:** 项目构建和依赖管理。
* **Lombok:** (可选, 本笔记中未显式在 Dept 类使用，但推荐) 通过注解减少 Java 代码的冗余。
* **MySQL:** 关系型数据库。
* **MyBatis:** (通过注解方式) 持久层框架，直接编写 SQL。

## 3. 前提：实体类与结果类

假设我们有如下实体类 `Dept.java` 和一个通用的返回结果类 `Result.java`。

`Dept.java`:
```java
// package com.example.myapp.entity; // 假设的包名

import java.time.LocalDateTime;

// (为简化，省略 Lombok 注解，实际项目中推荐使用 @Data, @NoArgsConstructor, @AllArgsConstructor)
public class Dept {
    private Integer id;
    private String name;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // Standard getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    @Override
    public String toString() {
        return "Dept{" +
               "id=" + id +
               ", name='" + name + '\'' +
               ", createTime=" + createTime +
               ", updateTime=" + updateTime +
               '}';
    }
}
````

`Result.java`:

Java

```
// package com.example.myapp.util; // 假设的包名

public class Result {
    private Integer code; // 1 for success, 0 for error (或其他自定义状态码)
    private String msg;
    private Object data;

    // 私有构造，防止直接实例化
    private Result() {}

    public static Result success(Object data) {
        Result r = new Result();
        r.code = 1; // 假设 1 代表成功
        r.msg = "操作成功";
        r.data = data;
        return r;
    }

    public static Result success() {
        Result r = new Result();
        r.code = 1;
        r.msg = "操作成功";
        return r;
    }

    public static Result error(String msg) {
        Result r = new Result();
        r.code = 0; // 假设 0 代表失败
        r.msg = msg;
        return r;
    }

    // Standard getters and setters
    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
```

_(请确保以上类已正确配置 `getters` 和 `setters`，如果使用 Lombok，则会自动生成)_

---

## 4. CRUD 操作步骤详解

### 4.1 查询部门 (根据ID - Read/Get)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 GET 请求的方法，通过路径变量接收 `id`。
    - 调用 `deptService.getById(id)`。
    - 返回 `Result.success(dept)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // package com.example.myapp.controller; // 假设的包名
    
    import com.example.myapp.entity.Dept;
    import com.example.myapp.service.DeptService;
    import com.example.myapp.util.Result;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.RestController;
    
    @RestController
    public class DeptController {
        @Autowired
        private DeptService deptService;
    
        @GetMapping("/depts/{id}")
        public Result getInfo(@PathVariable Integer id){
            System.out.println("根据ID查询部门 : " + id);
            Dept dept = deptService.getById(id); // 调用 Service 层
            if (dept != null) {
                return Result.success(dept);
            }
            return Result.error("未找到ID为 " + id + " 的部门");
        }
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `DeptController.java` 中的 `deptService.getById(id)` 上使用 `Alt+Enter` (IDEA 快捷键) 或手动创建方法。
    - 定义 `getById(Integer id)` 接口方法。
    
    <!-- end list -->
    
    Java
    
    ```
    // package com.example.myapp.service; // 假设的包名
    
    import com.example.myapp.entity.Dept;
    import java.util.List; // 为后续 listAll 方法准备
    
    public interface DeptService {
        Dept getById(Integer id);
        // 后续会添加其他方法
        List<Dept> listAll();
        void addDept(Dept dept);
        void updateDept(Dept dept);
        void deleteDeptById(Integer id);
    }
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 在 `DeptService` 接口名上点击左侧绿色小箭头跳转到实现类，或手动创建。
    - 实现 `getById(Integer id)` 方法。
    - 调用 `deptMapper.getById(id)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // package com.example.myapp.service.impl; // 假设的包名
    
    import com.example.myapp.entity.Dept;
    import com.example.myapp.mapper.DeptMapper;
    import com.example.myapp.service.DeptService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import java.util.List; // 为后续 listAll 方法准备
    import java.time.LocalDateTime; // 为后续 add/update 方法准备
    
    @Service
    public class DeptServiceImpl implements DeptService {
        @Autowired
        private DeptMapper deptMapper;
    
        @Override
        public Dept getById(Integer id) {
            return  deptMapper.getById(id); // 调用 Mapper 层
        }
    
        // 后续会实现其他方法
        @Override
        public List<Dept> listAll() {
            // 待实现
            return deptMapper.findAll();
        }
    
        @Override
        public void addDept(Dept dept) {
            // 待实现
            dept.setCreateTime(LocalDateTime.now());
            dept.setUpdateTime(LocalDateTime.now());
            deptMapper.insert(dept);
        }
    
        @Override
        public void updateDept(Dept dept) {
            // 待实现
            dept.setUpdateTime(LocalDateTime.now());
            deptMapper.update(dept);
        }
    
        @Override
        public void deleteDeptById(Integer id) {
            // 待实现
            deptMapper.deleteById(id);
        }
    }
    ```
    
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - 在 `DeptServiceImpl.java` 中的 `deptMapper.getById(id)` 上使用 `Alt+Enter` 或手动创建方法。
    - 定义 `getById(Integer id)` 接口方法。
    - 使用 `@Select` 注解编写 SQL 查询语句。
    
    <!-- end list -->
    
    Java
    
    ```
    // package com.example.myapp.mapper; // 假设的包名
    
    import com.example.myapp.entity.Dept;
    import org.apache.ibatis.annotations.*;
    import java.util.List; // 为后续 findAll 方法准备
    
    @Mapper
    public interface DeptMapper {
        // 根据id查询部门
        @Select("SELECT id, name, create_time , update_time from depts WHERE id = #{id}")
        Dept getById(Integer id);
    
        // 后续会添加其他方法
        @Select("SELECT id, name, create_time, update_time FROM depts")
        List<Dept> findAll();
    
        @Insert("INSERT INTO depts (name, create_time, update_time) VALUES (#{name}, #{createTime}, #{updateTime})")
        @Options(useGeneratedKeys = true, keyProperty = "id") // 如果需要返回自增ID
        void insert(Dept dept);
    
        @Update("UPDATE depts SET name = #{name}, update_time = #{updateTime} WHERE id = #{id}")
        void update(Dept dept);
    
        @Delete("DELETE FROM depts WHERE id = #{id}")
        void deleteById(Integer id);
    }
    ```
    

---

### 4.2 查询所有部门 (Read All/List)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 GET 请求的方法，例如 `/depts`。
    - 调用 `deptService.listAll()`。
    - 返回 `Result.success(deptList)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    // import java.util.List; // 确保已导入
    
    @GetMapping("/depts")
    public Result listAllDepts() {
        System.out.println("查询所有部门");
        List<Dept> deptList = deptService.listAll(); // 调用 Service 层
        return Result.success(deptList);
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - (已在上面 `getById` 部分的 `DeptService.java` 中定义 `List<Dept> listAll();`)
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - (已在上面 `getById` 部分的 `DeptServiceImpl.java` 中初步实现，调用 `deptMapper.findAll()`)
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - (已在上面 `getById` 部分的 `DeptMapper.java` 中定义 `List<Dept> findAll();` 并使用 `@Select` 注解)

---

### 4.3 添加部门 (Create/Add)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 POST 请求的方法，例如 `/depts`，通过 `@RequestBody` 接收部门信息。
    - 调用 `deptService.addDept(dept)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    // import org.springframework.web.bind.annotation.PostMapping;
    // import org.springframework.web.bind.annotation.RequestBody; // 确保已导入
    
    @PostMapping("/depts")
    public Result addDept(@RequestBody Dept dept) {
        System.out.println("添加部门: " + dept.getName());
        deptService.addDept(dept); // 调用 Service 层
        // 如果 service 层或 mapper 层返回了带 ID 的对象，可以将其放入 Result
        // 例如: Dept createdDept = deptService.addDept(dept); return Result.success(createdDept);
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - (已在上面 `getById` 部分的 `DeptService.java` 中定义 `void addDept(Dept dept);`)
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - (已在上面 `getById` 部分的 `DeptServiceImpl.java` 中初步实现，设置时间并调用 `deptMapper.insert(dept)`)
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - (已在上面 `getById` 部分的 `DeptMapper.java` 中定义 `void insert(Dept dept);` 并使用 `@Insert` 和 `@Options` 注解)

---

### 4.4 修改部门 (Update)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 PUT 请求的方法，例如 `/depts` 或 `/depts/{id}`，通过 `@RequestBody` 接收更新的部门信息。
    - 调用 `deptService.updateDept(dept)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    // import org.springframework.web.bind.annotation.PutMapping; // 确保已导入
    
    @PutMapping("/depts") // 通常 PUT 请求体中应包含 ID
    public Result updateDept(@RequestBody Dept dept) {
        if (dept.getId() == null) {
            return Result.error("更新部门时必须提供部门ID");
        }
        System.out.println("修改部门ID: " + dept.getId() + ", 新名称: " + dept.getName());
        deptService.updateDept(dept); // 调用 Service 层
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - (已在上面 `getById` 部分的 `DeptService.java` 中定义 `void updateDept(Dept dept);`)
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - (已在上面 `getById` 部分的 `DeptServiceImpl.java` 中初步实现，设置更新时间并调用 `deptMapper.update(dept)`)
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - (已在上面 `getById` 部分的 `DeptMapper.java` 中定义 `void update(Dept dept);` 并使用 `@Update` 注解)

---

### 4.5 删除部门 (Delete)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 DELETE 请求的方法，例如 `/depts/{id}`，通过 `@PathVariable` 接收 `id`。
    - 调用 `deptService.deleteDeptById(id)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    // import org.springframework.web.bind.annotation.DeleteMapping; // 确保已导入
    
    @DeleteMapping("/depts/{id}")
    public Result deleteDept(@PathVariable Integer id) {
        System.out.println("删除部门ID: " + id);
        deptService.deleteDeptById(id); // 调用 Service 层
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - (已在上面 `getById` 部分的 `DeptService.java` 中定义 `void deleteDeptById(Integer id);`)
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - (已在上面 `getById` 部分的 `DeptServiceImpl.java` 中初步实现，调用 `deptMapper.deleteById(id)`)
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - (已在上面 `getById` 部分的 `DeptMapper.java` 中定义 `void deleteById(Integer id);` 并使用 `@Delete` 注解)

---

## 5. 总结与展望

本笔记通过简单的部门 (Dept) 管理示例，展示了如何在 Spring Boot 项目中搭建 Controller、Service、Mapper (MyBatis 注解风格) 三层架构，并实现基本的增删改查操作。每一步都力求清晰，模拟了使用 IDE (如 IntelliJ IDEA) 开发时，从上层到底层逐层定义接口和实现的过程。

**前后端联调关键点:**

- **Controller 层是桥梁:** 前端通过 HTTP 请求（如 GET, POST, PUT, DELETE）访问 Controller 中定义的 URL 路径。
- **数据格式:** 前后端通常使用 JSON 格式交换数据。`@RequestBody` 用于接收前端发送的 JSON 数据，`@RestController` (或 `@ResponseBody`) 会自动将 Java 对象转换为 JSON 响应。
- **请求参数:**
    - `@PathVariable` 用于获取 URL 路径中的参数 (如 `/depts/{id}` 中的 `id`)。
    - `@RequestParam` 用于获取查询参数 (如 `/depts/search?name=研发部` 中的 `name`)。
    - `@RequestBody` 用于获取请求体中的数据 (通常是 POST, PUT 请求中的 JSON 对象)。
- **响应结果:** 后端通过 `Result` 对象封装操作结果（成功/失败信息、数据）返回给前端。前端根据 `Result` 中的 `code` 和 `msg` 判断操作状态，并使用 `data` 渲染页面或进行其他处理。
- **API 测试工具:** 在没有前端页面的情况下，可以使用 Postman、Insomnia 等工具测试后端 API 接口的正确性。

在实际项目中，还需要深入考虑：

- 更完善的异常处理机制 (如全局异常处理器 `@ControllerAdvice`)。
- Spring 的事务管理 (`@Transactional`) 的精细化使用。
- 输入参数校验 (如使用 `javax.validation` 或 Spring Validation)。
- 安全性 (如 Spring Security 进行认证和授权)。
- 更复杂的业务逻辑和数据库查询。
- 日志记录。
- 单元测试和集成测试。

希望这份笔记对您有所帮助！