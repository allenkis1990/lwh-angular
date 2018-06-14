# 班级开通统计

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ ★ 日快照报表 ★ ★ </span>

[TOC]

------------------------------------------

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

------------------------------------------

## 获取专业级别

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

------------------------------------------

## 获取学习类别

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

------------------------------------------

## 获取培训班列表

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

------------------------------------------

## 获取列表

### 地址
`url:`
### 请求参数

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;"> ★ 请支持跳页查看 ★  </span>

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

   - olb --> online bank --> 网银
   - scene -- > --> 现场
   - total -- > --> 合计

{
    "info"  : [

        ~ 合计 （合计是统计所有页面的合计）
        {
            "trainClassName"        : "培训班名称",
            "olbEstablish"          : "ALFKI",
            "olbQuit"               : "Alfreds Futterkiste",
            "olbExchangeIn"         : "Maria Anders",
            "olbExchangeOut"        : 0,
            "olbNetEstablish"       : 0,
            "sceneEstablish"        : 0,
            "sceneQuit"             : 0,
            "sceneExchangeIn"       : 0,
            "sceneExchangeOut"      : 0,
            "sceneNetEstablish"     : 0,
            "totalEstablish"        : 0,
            "totalQuit"             : 0,
            "totalExchangeIn"       : 0,
            "totalExchangeOut"      : 0,
            "totalNetEstablish"     : 0
        },
        ~ 单个培训班
        {
            "trainClassName"        : "培训班名称",
			// 网银开通
            "olbEstablish"          : "ALFKI",
            "olbQuit"               : "Alfreds Futterkiste",
            "olbExchangeIn"         : "Maria Anders",
            "olbExchangeOut"        : 0,
            "olbNetEstablish"       : 0,
			// 现场开通
            "sceneEstablish"        : 0,
            "sceneQuit"             : 0,
            "sceneExchangeIn"       : 0,
            "sceneExchangeOut"      : 0,
            "sceneNetEstablish"     : 0,
            // 合计
            "totalEstablish"        : 0,
            "totalQuit"             : 0,
            "totalExchangeIn"       : 0,
            "totalExchangeOut"      : 0,
            "totalNetEstablish"     : 0
        }
    ],
    "netEstablish": "", // 净开通
    "totalTransactionAmount":"", // 成交总额
    "totalSize": 20,
    "status": true
}

````

------------------------------------------

## 导出


<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;"> ★ 导出为导出列表数据 ★  </span>


### 导出地址


`url: `

### 请求参数

````
	todo
````

------------------------------------------

## 统计口径：
1.  搜索条件：学时年度（默认为全部年度）、专业等级（为培训类目下的属性，有全部、新会计人员、初级及以下会计人员、中级会计人员、高级会计人员）、学习类别（全部、行政事业类、企业类）；班级名称--->对应为系统中已发布在培的班级，班级名称支持模糊查询；开通时间---->开通时间可单选某个框查询，只选择一个框时，查的是截止到当前选择的时间点的数据，若是两个时间点都选择，则是这时间段内的累计数据对减（即特定时间段内的实际开通数据）；开通数为搜索时间内开通的数据，而退班、换班这个是指这个时间内累计退班、换班的数据（非搜索时间内开通数据的基础上进行换班、退班的数据），比如9.7日查开通时间为1.1-8.31的数据，则此时开通数为1.1-8.31号实现开班的人次，而退班、换班（含换出、换入）是统计从1.1-8.31这个时间段累计的值 ；
2.  列表字段：
	1）培训班名称：对应的是培训商品名称（目前的系统中创建的培训商品其实就是培训班）
	2）开通：实际缴费成功并且开通的数据（学员收到虚拟物品的时间）
	3）退班：后台退班执行操作的订单
	4）换出：统计被更换的培训班
	5）换入：统计变更后的目标培训班
	6）净开通：开通+换入-换出-退班
3. 开通时间：日期可选为范围截止到前一天的时间；列表数据按开通人数降序排


