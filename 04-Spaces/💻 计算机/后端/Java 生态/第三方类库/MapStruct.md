```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.3</version>
</dependency>

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>1.6.3</version>
</dependency>
```

🏷️ 基础概念 ：
- MapStruct 会自动处理类里面的嵌套转换，比如 subOrderDTO 会自动转为 subOrderBO
- MapStruct 会自动处理类里面的 List 数据，比如 `List<subOrderDTO>` 会自动转为 `List<subOrderBO>`

# 📚 配置 Converter
🏷️ 类一定要加 @SuperBuilder

## 📖 @Mapper
- componentModel
	- spring 表示生成的实现类要使用 Spring 容器管理

## 📖 @BeanMapping
- nullValuePropertyMappingStrategy 当源对象字段为 null 时如何处理
	- NullValuePropertyMappingStrategy.IGNORE 忽略

```java
@Mapper(componentModel = "spring")
public interface PrdBrandConverter {

    // ==================== DTO <-> BO ====================
    PrdBrandBO toBO(PrdBrandDTO dto);

	// ==================== BO <-> BO ====================
	// 将新的 BO 中的非空值更新到现有的 BO 对象中  
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)  
	PrdBrandBO updateBO(PrdBrandBO source, @MappingTarget PrdBrandBO target);

	// ==================== BO -> VO ====================
    List<PrdBrandVO> toVOList(List<PrdBrandBO> list);

}
```

# 📚 基本使用
```java
private @Resource PrdBrandConverter brandConverter;

PrdBrandBO bo = brandConverter.toBO(dto)
```


# 📚 高级特性
## 📖 @AfterMapping
- @AfterMapping 可以在转换对象后，执行一些逻辑处理
```java
/**  
 * 在所有的 dto 转到 bo 的方法中，添加这段逻辑
 */
@AfterMapping
default void afterDtoToBO(ProductDTO dto, @MappingTarget ProductBO bo) {
	// 追踪分类列表
	boolean isNewProduct = (bo.getId() == null);
	if (bo.getPrdCategoryList() != null) {
		if (isNewProduct) {
			bo.getPrdCategoryList().forEach(bo::trackAdd);
		} else {
			bo.getPrdCategoryList().forEach(bo::trackModify);
		}
	}
}
```


🏷️ 只映射非null字段

🏷️ 使用表达式进行自定义逻辑








