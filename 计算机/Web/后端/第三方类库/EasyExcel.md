
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>4.0.3</version>
</dependency>
```

# ❤️ 读


# ❤️ 写
## 💛 定义 excel 实体类
- `@ExcelProperty` 列属性
	- value 列名
	- index 列的位置
	- converter 定义内容的转换器
- `@ExcelIgnore` 忽略某个字段
- 样式
	- `@ContentRowHeight(30)` 行高
	- `@HeadRowHeight(20)` 头行高
	- `@ColumnWidth(20)` 列宽

```java
@Data
@ContentRowHeight(30)  
@HeadRowHeight(20)  
@ColumnWidth(20)
public class DemoData {
	@ExcelProperty(value = "标题", index = 0)  
	private String title;  
	@ExcelProperty(value = "日期", index = 1)  
	private LocalDate date;  
	@ColumnWidth(7)
	@ExcelProperty(value = "数字", index = 2)  
	private Double number;

    @ExcelIgnore
    private String ignore;
}
```

## 💛  写入策略
### 💙 数据量小 < 5000 行
- `write(文件名，excel实体)` 定义参数配置
- 筛选
	- `excludeColumnFieldNames(需要被排除的字段集合)` 排除 excel 实体中不需要的字段
	- `includeColumnFieldNames(只需保留的字段集合)` 选出 excel 实体中需要的字段
- `sheet(名称)` 底部工作表的名称
- `doWrite(集合数据)` 将集合数据写入文件

```java
// 定义文件路径
String fileName = "E:\\文档\\测试一下.xlsx";
EasyExcel.write(fileName, DemoData.class)
		.sheet("模板")
		// 排除date列
		.excludeColumnFieldNames(List.of("date"))
		.includeColumnFieldNames(List.of("title"))
		.doWrite(List.of(
				DemoData.builder().title("吃饭").date(LocalDate.now()).number(23d).build(),
				DemoData.builder().title("睡觉").date(LocalDate.now()).number(2d).build(),
				DemoData.builder().title("敲代码").date(LocalDate.now()).number(299d).build()
		));
```

### 💙 数据量大
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20240926224840.png)
```java
String fileName = "E:\\文档\\测试一下.xlsx";
// 用文件名构建出的ExcelWriter，可以在释放资源之前多次写入数据
try (ExcelWriter excelWriter = EasyExcel.write(fileName).build()) {
	for (int i = 0; i < 4; i++) {
		// 构建配置
		WriteSheet writeSheet = EasyExcel.writerSheet("工作表1")
				.head(DemoData.class)
				.build();
		// 构建数据
		List<DemoData> dataList = List.of(
				DemoData.builder().title("吃饭").date(LocalDate.now()).number(23d).build(),
				DemoData.builder().title("睡觉").date(LocalDate.now()).number(2d).build(),
				DemoData.builder().title("敲代码").date(LocalDate.now()).number(299d).build()
		);
		// 写入数据
		excelWriter.write(dataList, writeSheet);
	}
}
```

## 💛 合并
### 💙 合并列
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20240926223348.png)
```java
@Data  
public class DemoData {  
    @ExcelProperty(value = {"合并", "标题"}, index = 0)  
    private String title;  
    @ExcelProperty(value = {"合并", "日期"}, index = 1)  
    private LocalDate date;  
    @ExcelProperty(value = {"合并", "数字"}, index = 2)  
    private Double number;  
}
```

### 💙 合并单元格
#### 💚 实体类方法
- 类上注解 `@OnceAbsoluteMerge(firstRowIndex = 5, lastRowIndex = 6, firstColumnIndex = 1, lastColumnIndex = 2)` 将第 6 - 7 行的 2 - 3 列合并成一个单元格
- 属性上注解 `@ContentLoopMerge(eachRow = 2)` 这一列上，每隔 2 行，合并单元格

```java
@Data  
// @OnceAbsoluteMerge(firstRowIndex = 5, lastRowIndex = 6, firstColumnIndex = 1, lastColumnIndex = 2)
public class DemoMergeData {
    @ContentLoopMerge(eachRow = 2)
    @ExcelProperty(value = "标题", index = 0)  
    private String title;  
    @ExcelProperty(value = "日期", index = 1)  
    private LocalDate date;  
    @ExcelProperty(value = "数字", index = 2)  
    private Double number;  
}
```

#### 💚 代码策略方法
```java
List<DemoData> dataList = List.of(
		DemoData.builder().title("吃饭").number(23d).build(),
		DemoData.builder().title("睡觉").number(2d).build(),
		DemoData.builder().title("敲代码").number(299d).build()
);

EasyExcel.write("E:\\文档\\测试一下.xlsx", DemoData.class)
		.sheet()
		// 设置策略，每两行就合并，从第一行就开始作用
		.registerWriteHandler(new LoopMergeStrategy(2, 0))
		.doWrite(dataList);
```

## 💛 单元格内换行
- `@ContentStyle` 
	- `wrapped` 是否自动换行
		- BooleanEnum.TRUE 开启自动换行

```java
@ContentStyle(wrapped = BooleanEnum.TRUE)
public class UnRegisteredWorkingHoursStatistics {
    @ExcelProperty(value = "用户姓名")
    private String userName;
    @ExcelProperty(value = "一级部门名称")
    private String firstLevelDepartmentName;
    @ExcelProperty(value = "部门名称")
    private String departmentName;
    @ExcelProperty(value = "未报工日期")
    private String unRegisteredDates;
    @ExcelProperty(value = "报工但未被审批的日期")
    private String unApprovedDates;
    @ExcelProperty(value = "审批人")
    private String approvalUserName;
}
```

- 写入时，以 `\n` 作为换行标识
```java
EasyExcel.write(response.getOutputStream(), UnRegisteredWorkingHoursStatistics.class)
		.sheet("工作表 1")
		.doWrite(List.of(
				UnRegisteredWorkingHoursStatistics.builder()
						.userName("张三")
						.firstLevelDepartmentName("技术部")
						.departmentName("研发部\n研发部\n拉拉部")
						.unRegisteredDates("2021-08-01,2021-08-02")
						.unApprovedDates("2021-08-03")
						.approvalUserName("李四")
						.build(),
				UnRegisteredWorkingHoursStatistics.builder()
						.userName("王五")
						.firstLevelDepartmentName("技术部\n研发部\n拉拉部")
						.departmentName("研发部")
						.unRegisteredDates("2021-08-01,2021-08-02")
						.unApprovedDates("2021-08-03")
						.approvalUserName("赵六")
						.build()
		));
```


## 💛 图片写入
```java
@Data  
public class DemoData {  
    @ExcelProperty(value = {"合并", "标题"}, index = 0)  
    private String title;  
    @ExcelProperty(value = {"合并", "日期"}, index = 1)  
    private LocalDate date;  
    @ExcelProperty(value = {"合并", "数字"}, index = 2)  
    private Double number;  
    @ExcelProperty(value = "图片", index = 3)  
    private URL url;  
}
```

```java
String fileName = "E:\\文档\\测试一下-2.xlsx";
List<DemoData> dataList = List.of(DemoData.builder()
		.title("老虎")
		.date(LocalDate.now())
		.number(666d)
		.url(new URL("https://img0.baidu.com/it/u=3859870425,2680506619&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=750"))
		.build());

EasyExcel.write(fileName, DemoData.class)
		.sheet()
		.doWrite(dataList);
```

## 💛 向 Web 写入
```java
@GetMapping("/getExcel")  
public void getExcel(HttpServletResponse response) {  
	response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	response.setCharacterEncoding("utf-8");
	String fileName = URLEncoder.encode("提单列表数据.xlsx", StandardCharsets.UTF_8);  
	response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + fileName);
	
	EasyExcel.write(response.getOutputStream(), DemoData.class)  
	        .sheet("工作表 1")  
	        .doWrite(List.of(DemoData.builder()  
	                .title("吃饭")  
	                .date(LocalDate.now())  
	                .number(23d)  
	                .build()  
	        ));
}
```



