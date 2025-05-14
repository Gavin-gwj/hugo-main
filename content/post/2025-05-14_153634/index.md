---
date: 2025-05-14T15:36:34+08:00
draft: true
title: Spring Boot 三层架构 CRUD 与前后端联调笔记
categories:
  - 笔记
  - Java
  - Springboot
tags:
  - 笔记
  - springboot
  - Java
---


# Spring Boot 三层架构 CRUD 与前后端联调笔记

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

* **Mapper/Repository (数据访问层/持久层):**
    * **职责:** 与数据库进行直接交互，执行 SQL 语句（或通过 ORM 框架操作）。
    * 提供原子性的数据操作方法（增、删、改、查）。
    * Spring Data JPA 中通常使用 `Repository` 接口。

**数据流向 (请求):** 前端 -> Controller -> Service -> Mapper/Repository -> 数据库
**数据流向 (响应):** 数据库 -> Mapper/Repository -> Service -> Controller -> 前端

## 2. 技术栈简介

* **Spring Boot:** 用于快速搭建和运行 Java 应用。
* **Maven:** 项目构建和依赖管理。
* **Lombok:** 通过注解减少 Java 代码的冗余（如 `getter`, `setter` 等）。
* **MySQL:** 关系型数据库。
* **Spring Data JPA:** 简化数据访问层的实现。

## 3. 后端三层架构实现示例

假设我们要实现一个简单的商品（Product）信息的增删改查。

### 3.1 实体类 (Entity) - 使用 Lombok

实体类代表数据库中的一张表。

`Product.java`:
```java
package com.example.myapp.entity;

import lombok.Data; // 自动生成 getter, setter, toString, equals, hashCode
import lombok.NoArgsConstructor; // 自动生成无参构造
import lombok.AllArgsConstructor; // 自动生成全参构造

import jakarta.persistence.Entity; // 或 javax.persistence.Entity
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // 声明这是一个 JPA 实体
public class Product {
    @Id // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 主键自增
    private Long id;
    private String name;
    private double price;
}
````

### 3.2 数据访问层 (Repository/Mapper)

使用 Spring Data JPA，我们只需定义一个接口继承 `JpaRepository`。

`ProductRepository.java`:

代码段

```
package com.example.myapp.repository;

import com.example.myapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // 声明为 Spring Bean
public interface ProductRepository extends JpaRepository<Product, Long> {
    // JpaRepository<实体类型, 主键类型>
    // 它已经提供了 save(), findById(), findAll(), deleteById() 等常用方法
    // 可以根据需要定义符合命名规范的查询方法，例如：
    // List<Product> findByName(String name);
}
```

### 3.3 服务层 (Service)

服务层封装业务逻辑。

`ProductService.java` (接口):

Java

````
package com.example.myapp.service;

import com.example.myapp.entity.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    Product addProduct(Product product);
    List<Product> getAllProducts();
    Optional<Product> getProductById(Long id);
    Product updateProduct(Long id, Product productDetails);
    void deleteProduct(Long id);
}
```

`ProductServiceImpl.java` (实现):

```java
package com.example.myapp.service.impl;

import com.example.myapp.entity.Product;
import com.example.myapp.repository.ProductRepository;
import com.example.myapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 用于事务管理

import java.util.List;
import java.util.Optional;

@Service // 声明为 Spring Bean
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Autowired // 依赖注入
    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional // 对于写操作，建议开启事务
    public Product addProduct(Product product) {
        // 可以在此添加业务校验逻辑
        return productRepository.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}
````

1

### 3.4 控制层 (Controller)

Controller 暴露 RESTful API 接口。

`ProductController.java`:

Java

```
package com.example.myapp.controller;

import com.example.myapp.entity.Product;
import com.example.myapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 标记为 RESTful 控制器，方法返回 JSON
@RequestMapping("/api/products") // 定义基础路径
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // 创建商品 (POST /api/products)
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product newProduct = productService.addProduct(product);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    // 获取所有商品 (GET /api/products)
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // 根据ID获取商品 (GET /api/products/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok) // 如果找到，返回 200 OK 和商品
                .orElse(ResponseEntity.notFound().build()); // 否则返回 404 Not Found
    }

    // 更新商品 (PUT /api/products/{id})
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        try {
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 删除商品 (DELETE /api/products/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build(); // 204 No Content 表示成功删除
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## 4. 前后端联调 (Frontend-Backend Connection)

前后端联调的核心在于前端通过 HTTP 协议与后端暴露的 API 接口进行通信。

### 4.1 通信基础

- **URL:** 后端 API 的地址，如 `http://localhost:8080/api/products`。
- **HTTP 方法:**
    
    - `POST`: 用于创建新资源 (Create)。
    - `GET`: 用于读取资源 (Read)。
    - `PUT`: 用于更新现有资源 (Update)。
    - `DELETE`: 用于删除资源 (Delete)。
    
- **Headers (请求头):** 包含元数据，如 `Content-Type: application/json` 表明请求体是 JSON 格式。
- **Body (请求体):** 在 `POST` 和 `PUT` 请求中，通常携带要发送给后端的数据（JSON 格式）。
- **Response (响应):** 后端返回的数据，通常包含状态码 (如 200 OK, 201 Created, 404 Not Found) 和响应体 (JSON 数据)。

### 4.2 前端请求示例 (使用 JavaScript `Workspace` API)

以下是前端如何调用上述后端 API 的概念性 JavaScript 示例。

#### 4.2.1 创建商品 (POST)

JavaScript

```
async function addProduct(productData) {
    // productData = { name: "New Laptop", price: 1200.99 }
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) { // 检查 HTTP 状态码是否表示成功
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newProduct = await response.json();
        console.log('Product added:', newProduct);
        return newProduct;
    } catch (error) {
        console.error('Error adding product:', error);
    }
}
```

#### 4.2.2 获取所有商品 (GET)

JavaScript

```
async function fetchAllProducts() {
    try {
        const response = await fetch('/api/products'); // GET 是默认方法
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        console.log('All products:', products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}
```

#### 4.2.3 根据 ID 获取商品 (GET)

JavaScript

```
async function fetchProductById(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (response.status === 404) {
            console.log('Product not found');
            return null;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        console.log('Product found:', product);
        return product;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
    }
}
```

#### 4.2.4 更新商品 (PUT)

JavaScript

```
async function updateProduct(id, productUpdateData) {
    // productUpdateData = { name: "Updated Laptop", price: 1150.00 }
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productUpdateData)
        });
        if (response.status === 404) {
            console.log('Product to update not found');
            return null;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedProduct = await response.json();
        console.log('Product updated:', updatedProduct);
        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
    }
}
```

#### 4.2.5 删除商品 (DELETE)

JavaScript

```
async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 404) {
            console.log('Product to delete not found');
            return false;
        }
        if (response.status === 204) { // 204 No Content 表示成功
            console.log('Product deleted successfully');
            return true;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}
```

### 4.3 调试技巧

- **浏览器开发者工具 (Network Tab):** 查看请求和响应的详细信息，包括 URL, 方法, Headers, Body, 状态码。
- **Postman / Insomnia:** API 测试工具，可以方便地发送各种 HTTP 请求并查看响应，无需编写前端代码即可测试后端 API。
- **后端日志:** 查看 Spring Boot 应用的控制台输出或日志文件，了解请求处理过程和潜在错误。
- **CORS (跨域资源共享):** 如果前端和后端部署在不同的域名或端口，后端需要配置 CORS 策略以允许前端访问。
    
    Java
    
    ```
    // 简单的全局 CORS 配置示例 (在 Spring Boot 中)
    // @Configuration
    // public class WebConfig implements WebMvcConfigurer {
    //     @Override
    //     public void addCorsMappings(CorsRegistry registry) {
    //         registry.addMapping("/api/**") // 允许 /api/ 下的所有路径
    //             .allowedOrigins("http://localhost:3000") // 允许的前端源
    //             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    //             .allowedHeaders("*")
    //             .allowCredentials(true);
    //     }
    // }
    ```
    

## 5. 总结

通过 Controller, Service, Mapper/Repository 的三层架构，我们可以构建出结构清晰、易于维护的后端应用。前端通过标准的 HTTP 协议与后端定义的 RESTful API 进行数据交互，实现完整的增删改查功能。理解各层职责和前后端通信机制是成功联调的关键。