```xml
<dependency>  
    <groupId>cn.zhxu</groupId>  
    <artifactId>bean-searcher-boot-starter</artifactId>  
    <version>4.3.4</version>  
</dependency>
```

> [!warning] 使用 Bean Searcher 来简化 JPA 的复杂条件查询

# ❤️ 配置
- 让 BeanSearcher 适配 JPA
```java
@Configuration
public class BeanSearcherConfig {

    /**
     * 让BeanSearcher适配JPA
     */
    @Bean
    public DbMapping bsJpaDbMapping(BeanSearcherProperties config) {
        var mapping = new DefaultDbMapping() {
            @Override
            public String toTableName(Class<?> beanClass) {
                // 识别 JPA 的 @Table 注解
                var table = beanClass.getAnnotation(jakarta.persistence.Table.class);
                if (table != null && StrUtil.isNotBlank(table.name())) {
                    return table.name();
                }
                // 识别 JPA 的 @Entity 注解
                var entity = beanClass.getAnnotation(jakarta.persistence.Entity.class);
                if (entity != null && StrUtil.isNotBlank(entity.name())) {
                    return entity.name();
                }
                return super.toTableName(beanClass);
            }

            @Override
            public String toColumnName(BeanField field) {
                // 识别 JPA 的 @Column 注解
                var column = field.getAnnotation(jakarta.persistence.Column.class);
                if (column != null && StrUtil.isNotBlank(column.name())) {
                    return column.name();
                }
                return super.toColumnName(field);
            }
        };

        Sql.DefaultMapping conf = config.getSql().getDefaultMapping();
        mapping.setTablePrefix(conf.getTablePrefix());
        mapping.setUpperCase(conf.isUpperCase());
        mapping.setUnderlineCase(conf.isUnderlineCase());
        mapping.setRedundantSuffixes(conf.getRedundantSuffixes());
        mapping.setIgnoreFields(conf.getIgnoreFields());
        mapping.setDefaultInheritType(conf.getInheritType());
        mapping.setDefaultSortType(conf.getSortType());

        return mapping;
    }
}
```

# 复杂条件查询
[运算符](https://bs.zhxu.cn/guide/param/field.html#%E5%AD%97%E6%AE%B5%E8%BF%90%E7%AE%97%E7%AC%A6) ：
- `Equal` / `NotEqual` 
- `GreaterThan` / `GreaterEqual` 大于，大于等于
- `Between` / `NotBetween` 
- `Contain` 
- `InList` / `NotIn` 多值

> [!warning] 如果传入的值为 null，则忽略该条件【~~比如下方的 title 为 null，则会忽略模糊查询~~】

```java
@Resource  
private BeanSearcher beanSearcher;

@Test
void test_2() {
	String title = null;
	// 构造条件
	Map<String, Object> map = MapUtils.builder()
			// 精确查询
			.field("strategyId", 10001).op(Equal.class)
			// 范围查询
			.field("awardCount", 10000L, 50000L).op(Between.class)
			// 模糊查询
			.field("awardTitle", title).op(Contain.class)
			.build();

	SearchResult<Award> search = beanSearcher.search(Award.class, map);
	search.getDataList().forEach(System.out::println);
}
```
