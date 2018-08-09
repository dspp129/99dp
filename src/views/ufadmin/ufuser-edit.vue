<style>
table, td, th{
    border:5px solid white;
}
.short-input {
    width: 110px;
}
</style>
<template>
    <Card :style="{minHeight}">
        <Tabs type="card">
            <TabPane label="基本信息" name="name1">
                <table>
                    <tr>
                        <td>姓　　名　</td>
                        <td><Input v-model="userInfo.realname" class="short-input" /></td>
                        <td>外语姓名　</td>
                        <td><Input v-model="userInfo.englishname" class="short-input" /></td>
                        <td>曾 用 名　</td>
                        <td><Input v-model="userInfo.nickyname" class="short-input" /></td>
                        <td>出生年月　</td>
                        <td>
                            <DatePicker type="date" v-modal="userInfo.birthday" transfer class="short-input" />
                        </td>
                        <td>照片</td>
                    </tr>
                    <tr>
                        <td>性　　别　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>国　　籍　</td>
                        <td><Input v-model="userInfo.guoji" class="short-input" /></td>
                        <td>籍　　贯　</td>
                        <td><Input v-model="userInfo.jiguan" class="short-input" /></td>
                        <td>出 生 地　</td>
                        <td><Input v-model="userInfo.chushengdi" class="short-input" /></td>
                    </tr>
                    <tr>
                        <td>民　　族　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>婚姻状况　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>健康情况　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>港澳台列表</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                    </tr>
                    <tr>
                        <td>外语语种　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>宗教信仰　</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td>宗教称谓　</td>
                        <td>
                            <Input v-model="userInfo.chushengdi" class="short-input" />
                        </td>
                        <td>教　　名　</td>
                        <td>
                            <Input v-model="userInfo.chushengdi" class="short-input" />
                        </td>
                    </tr>
                    <tr>
                        <td>身份证件一</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td colspan="2">
                            <Input v-model="userInfo.chushengdi" />
                        </td>
                        <td>身份证件二</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td colspan="2">
                            <Input v-model="userInfo.chushengdi"/>
                        </td>
                    </tr>
                    <tr>
                        <td>身份证件三</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td colspan="2">
                            <Input v-model="userInfo.chushengdi" />
                        </td>
                        <td>身份证件四</td>
                        <td>
                            <Select v-model="userInfo.xingbie" transfer class="short-input" >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                            </Select>
                        </td>
                        <td colspan="2">
                            <Input v-model="userInfo.chushengdi"/>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">是否取得国(境)外永久居留权</td>
                        <td>
                            <Checkbox v-model="userInfo.checkbox"></Checkbox>
                        </td>
                        <td colspan="2">
                            取得国(境)外永久居留权国家(地区)名称
                        </td>
                        <td>
                            <Input v-model="userInfo.chushengdi" class="short-input" />
                        </td>
                        <td>离开大陆时间</td>
                        <td>
                            <DatePicker type="date" v-modal="userInfo.birthday" transfer class="short-input" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            现任社会职务
                        </td>
                        <td colspan="3">
                            <Input v-model="userInfo.chushengdi" />
                        </td>
                        <td>
                            参加工作年月
                        </td>
                        <td>
                            <DatePicker type="date" v-modal="userInfo.birthday" transfer class="short-input" />
                        </td>
                        <td>档案管理单位</td>
                        <td>
                            <Input v-model="userInfo.chushengdi" class="short-input" />
                        </td>
                    </tr>
                </table>
            </TabPane>
            <TabPane label="综合情况" name="name2">标签二的内容</TabPane>
            <TabPane label="学习及工作情况" name="name3">标签三的内容</TabPane>
            <TabPane label="联系信息" name="name4">标签三的内容</TabPane>
            <TabPane label="家庭及社会关系" name="name5">标签三的内容</TabPane>
            <TabPane label="政治安排" name="name6">标签三的内容</TabPane>
            <TabPane label="推荐情况" name="name7">标签三的内容</TabPane>
            <TabPane label="考察材料及人物简历" name="name8">标签三的内容</TabPane>
        </Tabs>
    </Card>
</template>



<script>

import EditableTable from './components/editable-table.vue'

const initUser = {
    health: 0
};

export default {
    name: 'ufuser-edit',
    components: {
        EditableTable
    },
    data () {
        return {
            userInfo :{},
            fullHeight: window.innerHeight,
            columnList1:[
                {
                    "title": "开始时间",
                    "key": "startDate",
                    "type": "date",
                    "width": 145
                },
                {
                    "title": "结束时间",
                    "key": "endDate",
                    "type": "date",
                    "width": 145
                },
                {
                    "autoIncrement" : true,
                    "title": "内容",
                    "key": "content",
                    "type": "text"
                },
                {
                    "title": "操作",
                    "key": "operation",
                    "width": 100,
                    "align": "center",
                    "fixed": "right",
                    "handle": true
                }
            ],
            dataList1:[
                {
                    startDate: "2018年8月"
                }
            ],
            columnList2:[
                {
                    "title": "称　谓",
                    "key": "chengwei",
                    "type": "selector",
                    "width": 120
                },
                {
                    "autoIncrement" : true,
                    "title": "姓　名",
                    "key": "username",
                    "type": "text",
                    "width": 120
                },
                {
                    "title": "出生年月",
                    "key": "birthday",
                    "type": "date",
                    "width": 145
                },
                {
                    "title": "政治面貌",
                    "key": "zhengzhimianmao",
                    "type": "selector"
                },
                {
                    "title": "工作单位及职务",
                    "key": "companyandtitle",
                    "type": "text"
                },
                {
                    "title": "操作",
                    "key": "operation",
                    "width": 100,
                    "align": "center",
                    "fixed": "right",
                    "handle": true
                }
            ],
            dataList2:[
                {
                    chengwei: 0,
                    username: '张三',

                    birthday: "2018-8-1",
                    zhengzhimianmao: 0,
                    companyandtitle: '部长',


                }
            ]
        };
    },
    methods: {
        init () {
            this.userInfo = JSON.parse(JSON.stringify(initUser))
        },
        handleResize (event) {
            this.fullHeight = document.documentElement.clientHeight
        },
        save(){
            console.log(this.dataList2);
        }
    },
    activated () {
    },
    deactivated (){
    },
    mounted () {
        window.addEventListener('resize', this.handleResize)
        this.init()
    },
    created () {
    },
    computed : {
        minHeight () {
            return this.fullHeight - 120 + 'px'
        }
    }
}
</script>