# 年度开通统计

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 日快照数据 ★ </span>

[TOC]

------------------------------------------

## 获取学时年度

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

## 获取列表

### 地址
`url:`

### 请求参数

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 请支持跳页查看 ★ </span>

````

	{
		startTime: '', // 时间
		endTime: '',// 时间
        learnTimeYear: '', //学时年度
		pageNo: 0,
		pageSize: 10,
	}

````

### 返回结果
````

{
    "info"  : [
    	~ 合计
        {
            "regionName"        : "培训班名称",
			// 网银开通
            "establishedHumanCount"          : "ALFKI",
            "qualifiedHumanCount"       : 0
        }
        ~ 单条数据
        {
            "regionName"        : "培训班名称",
			// 网银开通
            "establishedHumanCount"          : "ALFKI",
            "qualifiedHumanCount"       : 0
        }
    ],
    "totalSize": 20,
    "status": true
}

````

------------------------------------------

## 导出

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 导出为导出列表数据 ★ </span>

### 导出地址


`url: `

### 请求参数...

````

````

------------------------------------------

## 统计口径：
1. 原4.0会计培训平台2013-2016年的数据要导回6.0，年度开始为2013年
2. 地区为证书所属地区，开通人次为实际净开通数，合格人次为通过考核要求人次
3. 导出字段为列表项导出
4. 列表排序按当前地区的顺序排；地区默认左对齐，其他各列为居中显示
5. 	系统查询时间为：当前所选学时年度班级开放缴费时间到截止上一个时点的数据；例：2016-08-29查2015学时年度开通人次，2015学时年度班级是2015-03-01开的班，统计时间是2015-03-01至2016-08-28