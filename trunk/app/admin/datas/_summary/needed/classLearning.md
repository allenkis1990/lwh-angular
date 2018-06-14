# 班级学习统计

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ ★ 截止上一天的数据 ★ ★ </span>

[TOC]

-------------------------------------------

## 获取学时年度

### 地址
`url:`

### 请求参数

````
	todo
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

-------------------------------------------

## 获取专业级别

### 地址
`url:`

### 请求参数

````
	todo
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

-------------------------------------------

## 获取学习类别

### 地址
`url:`

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

-------------------------------------------

## 获取列表

### 地址
`url:`

### 请求参数

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 请支持跳页查看 ★ </span>

````

	{
		startTime: '', // 开通时间
		endTime: '',// 开通时间
		learnCategory: '', // 学习类别
		professionalLevel: '',// 专业级别
		trainClassId: '',// 培训班Id
		learnTimeYear: '', // 学时年度
		pageNo: 0,
		pageSize: 10,
	}

````

### 返回结果
````

{
    "info"  : [

        {
        	"id": "",
            "trainClassName"        : "培训班名称",
            "netEstablish"          : "ALFKI",
            "notLearnYet"           : "Alfreds Futterkiste",
            "learning"              : "Maria Anders",
            "learned"               : 0,
            "notExamYet"            : 0,
            "exammed"               : 0,
            "qualified"             : 0,
            "qualifiedRate"         : 0 // 合格率
        }
    ],
    "totalSize": 20,
    "status": true
}

````

-------------------------------------------

## 导出

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">1. 导出列表数据 ★ </span>

	可选导出的列表数据，是当前列表数据，还是列表的人员详细


<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">2. 导出列表人员详细 ★ </span>

	列表人员详细的字段：姓名、身份证、地区、手机号码、邮箱、培训班名称、开通日期、学习情况、学时（已获/要求）、弹窗成绩、考试成绩、是否合格
        若当前搜索的是全部班级，并点击导出，则默认是导出所有班级的人员信息，列出导出的excel以班级为维度用sheet区隔

### 导出地址

`url: `

### 请求参数...

````
	todo
````

-------------------------------------------

## 统计口径：
1. 搜索条件：学时年度，开通时间段（年月日至年月日），专业等级，学习类别   ，班级名称模糊搜索
2. 列表字段：培训班名称（即培训商品名称），净开通（具体实际开班人次，扣除退班、换出人次），学习中、未学习、已学完、已考试、未考试、已合格、合格率；
	1) 净开通：扣除退班、换出后的实际有效的培训班人数；净开通=未学习+学习中+已学完
	2) 未学习：班级学习进度=0
	3) 学习中：0>班级学习进度<100%或考核进度值的人数
	4) 已学完：班级学习进度 >=100%（考核进度值达标）的人数；已学完=已考试+未考试
	5) 已考试：已参加过考试的人数（按人数统计，考多次也只算1）
	6) 未考试：已学完未参加考试的人数
	7) 已合格：已达到考核要求的人数
	8) 合格率：已合格/开班人数
3. 列表数据按开通时间查（为截止昨天的开通数，及其对应人员的学习情况，如9.7查询，开通时间为1.1-1.31，则是统计1.1-1.31开通了31个人，无退班、换班数据（如果这期间有退换班，则净开通要减），则净开通数为31，后面的学习数据指这31个人在截止1.31号那天的学习情况）