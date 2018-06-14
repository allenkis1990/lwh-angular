# 地区学习统计

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 日快照报表， 按地区维度统计学习详细情况 ★ </span>

[TOC]

---------------------------------------------

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

---------------------------------------------

## 获取地区

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

---------------------------------------------

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

---------------------------------------------

## 获取列表

### 地址
`url:`
### 请求参数

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 请支持跳页查看 ★ </span>

````

	{
		startTime: '', // 开通时间
		endTime: '',// 开通时间
		region: '', // 地区
		gradeLevel: '',// 职称等级
		learnTimeYear: '', // 学时年度
		pageNo: 0,
		pageSize: 10,
	}

````

### 返回结果
````

{
    "info"  : [

        ~ 合计 （合计是统计所有页面的合计）
          {
            "regionName"        : "",
            "netEstablish"          : "ALFKI",
            "notLearnYet"           : "Alfreds Futterkiste",
            "learning"              : "Maria Anders",
            "learned"               : 0,
            "notExamYet"            : 0,
            "exammed"               : 0,
            "qualified"             : 0,
            "qualifiedRate"         : 0 // 合格率
        },
        ~ 单个培训班
        {
        	"id": "",
            "regionName"        : "",
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
    "netEstablish": "", // 净开通
    "totalTransactionAmount":"", // 成交总额
    "totalSize": 20,
    "status": true
}

````

---------------------------------------------

## 导出

<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 导出列表数据 ★ </span>

	可选导出的列表数据，是当前列表数据，还是列表的人员详细
    
<span style="color:red;font-weight:bold;padding: 6px;border-radius:6px;border: 1px solid;">★ 导出列表人员详细 ★ </span>

	列表人员详细的字段：姓名、身份证、地区、手机号码、邮箱、培训班名称、开通日期、学习情况、学时（已获/要求）、弹窗成绩、考试成绩、是否合格

### 导出地址


`url: `

### 请求参数

````

````

---------------------------------------------

## 统计口径：
地区：按学员证书所在地区，即会计管理系统中【所属会计主管部门】项前面的归属区域，地区取最小级，如学员A属三明市沙县财政局，则地区为三明市沙县
1. 搜索条件：学时年度，地区（按证书所在地的归属区域，地区可查到最小级），职称等级（为人员的职称等级，有全部、无、初级、中级、高级），开通时间段（年月日至年月日）
2. 列表字段：
	1）地区：证书所在地区
	2）开通：实际缴费成功并且开通的数据（学员收到虚拟物品的时间）
	3）退班：后台退班执行操作的订单
	4）换出：统计被更换的培训班
	5）换入：统计变更后的目标培训班
	6）净开通：开通+换入-换出-退班
3. 开通时间查询截止到前一天的累计数据；列表数据按地区区划查询