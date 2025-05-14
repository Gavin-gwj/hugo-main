---
date: 2025-05-14T15:36:34+08:00
draft: true
title: Spring Boot 简单的增删改查功能的实现
categories:
  - 笔记
  - Java
  - Springboot
tags:
  - 笔记
  - springboot
  - Java
---


# Springboot简单的增删改查步骤
---

## CRUD 操作步骤详解

### 1. 查询部门 (根据ID - Read/Get)

这是您提供的示例，我们以此为起点。

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 GET 请求的方法，通过路径变量接收 `id`。
    - 调用 `deptService.getById(id)`。
    - 返回 `Result.success(dept)`。
    
    <!-- end list -->
    
    Java
    
    ```
    @RestController
    public class DeptController {
        @Autowired
        private DeptService deptService;
    
        @GetMapping("/depts/{id}")
        public Result getInfo(@PathVariable Integer id) {
            System.out.println("根据ID查询部门 : " + id);
            Dept dept = deptService.getById(id); // 调用 Service 层
            return Result.success(dept);
        }
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `DeptController.java` 中的 `deptService.getById(id)` 上使用 `Alt+Enter` (IDEA 快捷键) 或手动创建方法。
    - 定义 `getById(Integer id)` 接口方法。
    
    <!-- end list -->
    
    Java
    
    ```
    public interface DeptService {
        Dept getById(Integer id);
    }
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 在 `DeptService` 接口名上点击左侧绿色小箭头跳转到实现类，或手动创建。
    - 实现 `getById(Integer id)` 方法。
    - 调用 `deptMapper.getById(id)`。
    
    <!-- end list -->
    
    Java
    
    ```
    @Service
    public class DeptServiceImpl implements DeptService {
        @Autowired
        private DeptMapper deptMapper;
    
        @Override
        public Dept getById(Integer id) {
            return deptMapper.getById(id); // 调用 Mapper 层
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
    @Mapper
    public interface DeptMapper {
        // 根据id查询部门
        @Select("SELECT id, name, create_time, update_time FROM depts WHERE id = #{id}")
        Dept getById(Integer id);
    }
    ```
    

---

### 2. 查询所有部门 (Read All/List)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 GET 请求的方法，例如 `/depts`。
    - 调用 `deptService.listAll()`。
    - 返回 `Result.success(deptList)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    @GetMapping("/depts")
    public Result listAllDepts() {
        System.out.println("查询所有部门");
        List<Dept> deptList = deptService.listAll(); // 调用 Service 层
        return Result.success(deptList);
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `deptService.listAll()` 上 `Alt+Enter` 创建方法。
    - 定义 `List<Dept> listAll();`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptService.java 接口中添加
    List<Dept> listAll();
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 实现 `listAll()` 方法。
    - 调用 `deptMapper.findAll()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptServiceImpl.java 中实现
    @Override
    public List<Dept> listAll() {
        return deptMapper.findAll(); // 调用 Mapper 层
    }
    ```
    
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - 在 `deptMapper.findAll()` 上 `Alt+Enter` 创建方法。
    - 定义 `List<Dept> findAll();`。
    - 使用 `@Select` 注解。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptMapper.java 接口中添加
    @Select("SELECT id, name, create_time, update_time FROM depts")
    List<Dept> findAll();
    ```
    

---

### 3. 添加部门 (Create/Add)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 POST 请求的方法，例如 `/depts`，通过 `@RequestBody` 接收部门信息。
    - 调用 `deptService.addDept(dept)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    @PostMapping("/depts")
    public Result addDept(@RequestBody Dept dept) {
        System.out.println("添加部门: " + dept.getName());
        deptService.addDept(dept); // 调用 Service 层
        // 可以在 service 层返回带 ID 的对象，如果需要的话
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `deptService.addDept(dept)` 上 `Alt+Enter` 创建方法。
    - 定义 `void addDept(Dept dept);` (或者 `Dept addDept(Dept dept);` 如果需要返回带ID的实体)。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptService.java 接口中添加
    void addDept(Dept dept);
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 实现 `addDept(Dept dept)` 方法。
    - (可选) 设置 `createTime` 和 `updateTime`。
    - 调用 `deptMapper.insert(dept)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptServiceImpl.java 中实现
    @Override
    public void addDept(Dept dept) {
        dept.setCreateTime(java.time.LocalDateTime.now());
        dept.setUpdateTime(java.time.LocalDateTime.now());
        deptMapper.insert(dept); // 调用 Mapper 层
    }
    ```
    
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - 在 `deptMapper.insert(dept)` 上 `Alt+Enter` 创建方法。
    - 定义 `void insert(Dept dept);`。
    - 使用 `@Insert` 注解。如果需要返回自增ID，可以添加 `@Options(useGeneratedKeys = true, keyProperty = "id")`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptMapper.java 接口中添加
    @Insert("INSERT INTO depts (name, create_time, update_time) VALUES (#{name}, #{createTime}, #{updateTime})")
    // @Options(useGeneratedKeys = true, keyProperty = "id") // 如果需要返回自增ID
    void insert(Dept dept);
    ```
    

---

### 4. 修改部门 (Update)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 PUT 请求的方法，例如 `/depts` 或 `/depts/{id}`，通过 `@RequestBody` 接收更新的部门信息。
    - 调用 `deptService.updateDept(dept)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    @PutMapping("/depts") // 通常 PUT 请求体中应包含 ID
    public Result updateDept(@RequestBody Dept dept) {
        System.out.println("修改部门ID: " + dept.getId() + ", 新名称: " + dept.getName());
        deptService.updateDept(dept); // 调用 Service 层
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `deptService.updateDept(dept)` 上 `Alt+Enter` 创建方法。
    - 定义 `void updateDept(Dept dept);`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptService.java 接口中添加
    void updateDept(Dept dept);
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 实现 `updateDept(Dept dept)` 方法。
    - 设置 `updateTime`。
    - 调用 `deptMapper.update(dept)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptServiceImpl.java 中实现
    @Override
    public void updateDept(Dept dept) {
        dept.setUpdateTime(java.time.LocalDateTime.now());
        deptMapper.update(dept); // 调用 Mapper 层
    }
    ```
    
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - 在 `deptMapper.update(dept)` 上 `Alt+Enter` 创建方法。
    - 定义 `void update(Dept dept);`。
    - 使用 `@Update` 注解。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptMapper.java 接口中添加
    @Update("UPDATE depts SET name = #{name}, update_time = #{updateTime} WHERE id = #{id}")
    void update(Dept dept);
    ```
    

---

### 5. 删除部门 (Delete)

- **步骤 1: Controller 层 (`DeptController.java`)**
    
    - 定义一个处理 DELETE 请求的方法，例如 `/depts/{id}`，通过 `@PathVariable` 接收 `id`。
    - 调用 `deptService.deleteDeptById(id)`。
    - 返回 `Result.success()`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptController.java 中添加
    @DeleteMapping("/depts/{id}")
    public Result deleteDept(@PathVariable Integer id) {
        System.out.println("删除部门ID: " + id);
        deptService.deleteDeptById(id); // 调用 Service 层
        return Result.success();
    }
    ```
    
- **步骤 2: Service 接口 (`DeptService.java`)**
    
    - 在 `deptService.deleteDeptById(id)` 上 `Alt+Enter` 创建方法。
    - 定义 `void deleteDeptById(Integer id);`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptService.java 接口中添加
    void deleteDeptById(Integer id);
    ```
    
- **步骤 3: Service 实现类 (`DeptServiceImpl.java`)**
    
    - 实现 `deleteDeptById(Integer id)` 方法。
    - 调用 `deptMapper.deleteById(id)`。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptServiceImpl.java 中实现
    @Override
    public void deleteDeptById(Integer id) {
        deptMapper.deleteById(id); // 调用 Mapper 层
    }
    ```
    
- **步骤 4: Mapper 接口 (`DeptMapper.java`)**
    
    - 在 `deptMapper.deleteById(id)` 上 `Alt+Enter` 创建方法。
    - 定义 `void deleteById(Integer id);`。
    - 使用 `@Delete` 注解。
    
    <!-- end list -->
    
    Java
    
    ```
    // 在 DeptMapper.java 接口中添加
    @Delete("DELETE FROM depts WHERE id = #{id}")
    void deleteById(Integer id);
    ```
    

---

这个笔记提供了一个非常基础的增删改查流程。在实际项目中，您还需要考虑异常处理、事务管理、更复杂的业务逻辑、参数校验、权限控制等。