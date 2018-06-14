# 选课统计


<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 日快照数据 ★ </span>

[TOC]

---------------------------------------------

## 获取课程提供商 (这里的课程提供商为默认取课件提供商)

### 地址
`url:`

### 请求参数

````

````

### 返回结果

````
	{
		"info":[
			{
				"id": "",
				"name": ""
			}
		],
		"status": true
	}
````

---------------------------------------------

## 获取列表

### 地址
`url:`

### 请求参数

`请支持跳页查看`
<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 请支持跳页查看 ★ </span>

````

	{
		startTime: '', // 选课时间
		endTime: '',// 选课时间
		courseProvider: '', // 学习类别
		courseName: '',// 课程名称
		pageNo: 0,
		pageSize: 10,
	}

````

### 返回结果
````

{
    "info"  : [
        {
            "courseName"        : "培训班名称",
			// 网银开通
            "courseProviders"          : "ALFKI",
            "humansCount"               : "Alfreds Futterkiste",
            "timesCount"         : "Maria Anders",
            "learnedCount"        : 0,
            "notLearnYetCount"       : 0
        }
    ],
    "totalSize": 20,
    "status": true
}

````

---------------------------------------------

## 导出

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 导出为导出列表数据 ★ </span>

### 导出地址


`url: `

### 请求参数

````

````


## 统计口径：
1. 默认查所有课程，列表数据按课次数降序排；
2. 选课人次：被学员购买或选择的课程次数
3. 选课人数：课程被学员选择的数量，若课程购买不限则1个买多次该课程也视为1
4. 已学数量：被选课后有在学习的数量，课程学习进度>0%
5. 未学数量：被选课后未学习的数量，课程学习进度=0%
6. 已学数量+未学数量=选课次数
7. 课程提供商为系统内置选项