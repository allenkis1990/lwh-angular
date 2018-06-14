# 人员激活情况

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★  ★ </span>


[TOC]

---------------------------------------

## 获取地区

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

---------------------------------------

## 获取职称等级

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

## 获取列表

### 地址
`url:`
### 请求参数

`请支持跳页查看`
````

	{
    	region: '',// 地区
        startTime: '', // 从业证书获得时间
        endTime: '',// 从业证书获取时间
		gradeLevel: '', // 职称等级
		status: '',// 激活状态
		year: '', //年度
		phone: '',// 电话号码
        below_55: true, //是否小于55岁
        notSignUpTimesReg: '',// lt gt ...
        notSighUpTimesValue: ''
	}

````

### 返回结果
````
{
    "info"  : [
        {
            id: '',
            name: '', // 名字
            identify: '',// 身份证
            account: '', //登录账号
            phone: '',// 电话号码
            gradeLevel: '',// 职称等级
            region: '', // 地区
            theYearNotSignUp: '', // 未报班年度
            theYearSignedUp: '' //已报班年度
        },
    ],
    "humanTimeCount":"", // 共几人次
    "totalSize": 20,
    "status": true
}

````

---------------------------------------

## 导出

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 导出为导出列表数据 ★ </span>

	导出字段：姓名、性别、身份证、登录帐号、地区（证书所在地区）、已报班年度（多个年度逗号隔开）、未报班年度（多个年度逗号隔开）、手机号码、单位名称、从业证书获得时间、邮箱

### 导出地址


`url: `

### 请求参数...

````

````


---------------------------------------


## 说明：
可查未激活人员数据，查已激活人员的未报班数据，用于短信群发通知学员
已激活的数据，查的是在搜索年度区域内的报班情况
从业证书获得时间（时间段查询，即系统创建该条数据的时间）
导出格式.CSV
截止上一天的数据
若搜索条件项都选择查询，则查询的结果为满足各项搜索条件的数据