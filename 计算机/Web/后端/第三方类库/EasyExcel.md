
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>4.0.3</version>
</dependency>

<dependency>
    <groupId>cn.idev.excel</groupId>
    <artifactId>fastexcel</artifactId>
    <version>1.0.0</version>
</dependency>
```

# ❤️ 读


# ❤️ 写
<u>数据量小于 5000 行</u> ：
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

<u>数据量大</u> ：
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

## 💛 实体类
### 💙 定义 excel 实体类
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

### 💙 单元格内换行
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

### 💙 图片写入
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

### 💙 向 Web 写入
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

## 💛 代码策略
### 💙 合并单元格
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

### 💙 数据相同合并单元格






# 实验功能
## 自适应行高
```java
import com.alibaba.excel.metadata.Head;
import com.alibaba.excel.write.handler.WriteHandler;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

public class CustomRowHeightHandler implements WriteHandler {

    @Override
    public void beforeCellCreate(Sheet sheet, Row row, Head head, int relativeRowIndex, int columnIndex, boolean isHead) {
        // Do nothing before cell creation
    }

    @Override
    public void afterCellDispose(Cell cell, Head head, int relativeRowIndex, boolean isHead) {
        if (!isHead) {
            // 获取当前单元格内容长度
            String cellValue = cell.getStringCellValue();
            if (cellValue != null) {
                // 根据内容长度动态设置行高
                int contentLength = cellValue.length();
                int rowHeight = Math.min(255, contentLength * 20); // 根据长度设置行高（最大行高为 255）
                cell.getRow().setHeight((short) rowHeight);
            }
        }
    }
}
```

```java
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.handler.WriteHandler;

import java.util.List;

public class ExcelExporter {
    public static void main(String[] args) {
        // 假设数据为以下列表
        List<UnRegisteredWorkingHoursStatistics> data = fetchData();

        // 写入 Excel
        EasyExcel.write("output.xlsx", UnRegisteredWorkingHoursStatistics.class)
                .registerWriteHandler(new CustomRowHeightHandler()) // 注册自定义行高处理器
                .sheet("Sheet1")
                .doWrite(data);
    }

    public static List<UnRegisteredWorkingHoursStatistics> fetchData() {
        // 模拟数据获取
        return List.of(
            new UnRegisteredWorkingHoursStatistics("张三", "研发部", "开发组", "2024-11-01,2024-11-02", "2024-11-03", "李四"),
            new UnRegisteredWorkingHoursStatistics("李四", "销售部", "销售组", "2024-11-05", "2024-11-06,2024-11-07", "王五")
        );
    }
}
```

