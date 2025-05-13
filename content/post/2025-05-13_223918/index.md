---
date = '2025-05-13T22:39:18+08:00'
draft = true
title = '标题'
categories = [
    "Test",
]
---
## 正文
## 1. 三层架构概述

三层架构（Three‐Tier Architecture）是将应用程序分为表现层、业务层和持久层三部分，各层关注点分离、职责单一，便于维护和扩展。

- **表现层（Presentation Layer）**：对外提供接口（Web、REST API、页面渲染等），负责请求接收与响应返回。
    
- **业务层（Business Layer）**：封装核心业务逻辑，是应用核心。
    
- **持久层（Data Access Layer）**：与数据库交互，负责 CRUD 操作。
    

---

## 2. 表现层（Controller）

### 2.1 职责

- 接收并校验客户端请求参数
    
- 调用业务层接口执行业务
    
- 组装并返回统一格式的响应（JSON、页面等）
    
- 异常捕获与统一响应处理
    

### 2.2 典型注解与示例

j@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 查询用户列表
    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 创建新用户
    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest req) {
        UserDto created = userService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

    

---

## 3. 业务层（Service）

### 3.1 职责

- 聚合与组织持久层数据，执行业务规则
    
- 事务管理（`@Transactional`）
    
- 调用外部 API、发送消息、调度任务等
    

### 3.2 典型设计

- 定义接口 + 实现类
    
- 通过接口编程，方便单元测试与替换实现
    

java

复制编辑

`public interface UserService {     List<UserDto> getAllUsers();     UserDto createUser(CreateUserRequest req); }  @Service public class UserServiceImpl implements UserService {      @Autowired     private UserRepository userRepository;      @Transactional     @Override     public UserDto createUser(CreateUserRequest req) {         // 1. 参数校验         // 2. 构造 Entity         User user = new User(req.getName(), req.getEmail());         // 3. 调用持久层保存         user = userRepository.save(user);         // 4. 返回 DTO         return new UserDto(user.getId(), user.getName(), user.getEmail());     }      @Override     public List<UserDto> getAllUsers() {         return userRepository.findAll()             .stream()             .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail()))             .collect(Collectors.toList());     } }`

- `@Service`：标记业务组件
    
- `@Transactional`：声明式事务
    

---

## 4. 持久层（Repository/DAO）

### 4.1 职责

- 与数据库交互，执行增删改查
    
- 封装 SQL 或者使用 Spring Data JPA
    

### 4.2 Spring Data JPA 示例

java

复制编辑

`@Entity @Table(name = "users") public class User {     @Id @GeneratedValue     private Long id;     private String name;     private String email;     // getters & setters... }  public interface UserRepository extends JpaRepository<User, Long> {     // 可根据方法名自动生成查询     Optional<User> findByEmail(String email); }`

- `JpaRepository<T, ID>`：提供常见 CRUD 方法
    
- 可自定义查询方法或使用 `@Query` 编写 JPQL/原生 SQL
    

---

## 5. 层间调用流程

1. **客户端** 发送 HTTP 请求 →
    
2. **Controller** 接收请求 → 参数绑定 & 校验 → 调用
    
3. **Service** 执行业务逻辑 → 调用持久层
    
4. **Repository** 操作数据库 → 返回实体
    
5. **Service** 将实体转为 DTO → 返回
    
6. **Controller** 将 DTO 包装为统一响应格式 → 返回给客户端
    

text

复制编辑

`Client → Controller → Service → Repository → Database         ←-----------返回结果------------←`

---

## 6. 事务管理与异常处理

- 在 **Service** 方法上使用 `@Transactional`：保证业务操作原子性
    
- 全局异常处理：定义 `@ControllerAdvice` 捕获并统一格式化错误响应
    

java

复制编辑

`@ControllerAdvice public class GlobalExceptionHandler {      @ExceptionHandler(MethodArgumentNotValidException.class)     public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {         // 构造错误消息列表         // 返回 400 Bad Request     }      @ExceptionHandler(Exception.class)     public ResponseEntity<ErrorResponse> handleOthers(Exception ex) {         // 日志记录         // 返回 500 Internal Server Error     } }`

---

## 7. 包结构推荐

text

复制编辑

`com.example.app ├── controller    // 表现层 │   └── UserController.java ├── service       // 业务层 │   ├── UserService.java │   └── impl/UserServiceImpl.java ├── repository    // 持久层 │   └── UserRepository.java ├── dto           // 数据传输对象 │   ├── UserDto.java │   └── CreateUserRequest.java ├── entity        // JPA 实体 │   └── User.java └── exception     // 自定义异常 & 处理     ├── GlobalExceptionHandler.java     └── ErrorResponse.java`

---

## 8. 小结

1. **分层职责清晰**，各层关注点分离，便于维护。
    
2. **注解驱动**：`@RestController`、`@Service`、`@Repository`、`@Transactional` 等让开发更简洁。
    
3. **接口编程**：业务层对外暴露接口，降低耦合。
    
4. **统一异常与事务管理**：提高系统健壮性。