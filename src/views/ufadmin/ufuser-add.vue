<style lang="less">
    @import '../../styles/common.less';
</style>
<template>
    <Card :style="{minHeight}">
         <Row class="margin-top-10">
            <Col span="5" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="姓　名">
                        <Input v-model="userInfo.name"></Input>
                    </FormItem>
                    <FormItem label="民　族">
                        <Input v-model="userInfo.minzu"></Input>
                    </FormItem>
                    <FormItem label="党　派">
                        <Select v-model="userInfo.dangpai">
                            <Option value="0" :key="0">——请选择——</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Col>

            <Col span="5" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="性　别">
                        <Input v-model="userInfo.name"></Input>
                    </FormItem>
                    <FormItem label="籍　贯">
                        <Input v-model="userInfo.mail"></Input>
                    </FormItem>
                    <FormItem label="入党时间">
                        <DatePicker format="yyyy-MM-dd" type="date" v-model="userInfo.rudangshijian" ></DatePicker>
                    </FormItem>

                </Form>
            </Col>

            <Col span="6" offset="1">
                <Form :label-width="110" label-position="left">
                    <FormItem label="出生年月">
                        <DatePicker format="yyyy-MM-dd" type="date" v-model="userInfo.birthday" ></DatePicker>
                    </FormItem>
                    <FormItem label="出生地">
                        <Input v-model="userInfo.mail" ></Input>
                    </FormItem>
                    <FormItem label="参加工作时间">
                        <DatePicker format="yyyy-MM-dd" type="date" v-model="userInfo.joinworkdate"></DatePicker>
                    </FormItem>

                </Form>
            </Col>
            <Col span="4" offset="1">
                <Upload
                    type="drag"
                    action="//">
                    <div style="height: 145px;">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>Click or drag files here to upload</p>
                    </div>
                </Upload>
            </Col>
        </Row>

        <Row>
            <Col span="5" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="健康情况">
                        <Select v-model="userInfo.health">
                            <Option :value="0" :key="0">——请选择——</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Col>
            <Col span="5" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="专业技术职务">
                        <Select v-model="userInfo.city">
                        </Select>
                    </FormItem>
                </Form>
            </Col>
            <Col span="11" offset="1">
                <Form :label-width="110" label-position="left">
                    <FormItem label="熟悉专业有何专长">
                        <Input v-model="userInfo.zhuanchang" />
                    </FormItem>
                </Form>
            </Col>
        </Row>

        <Row>
            <Col span="7" offset="1">
                <Form :label-width="140" label-position="left">
                    <FormItem label="全日制教育学历学位">
                        <Select v-model="userInfo.health">
                            <Option :value="0" :key="0">——请选择——</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Col>
            <Col span="3" offset="1">
                <Select v-model="userInfo.health">
                    <Option :value="0" :key="0">——请选择——</Option>
                </Select>
            </Col>

            </Col>
            <Col span="7" offset="1">
                <Form label-position="left">
                    <FormItem label="毕业院校系及专业">
                        <div style="display: inline-block;">
                            <Input  value="computed自动调整，仿高度"></Input>
                           
                        </div>
                    </FormItem>
                </Form>
            </Col>
            <Col span="4">
                 <Input v-model="userInfo.zhuanchang"></Input>
            </Col>
        </Row>

        <Row>
            <Col span="7" offset="1">
                <Form :label-width="140" label-position="left">
                    <FormItem label="在职教育学历学位">
                        <Select v-model="userInfo.health">
                            <Option :value="0" :key="0">——请选择——</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Col>
            <Col span="3" offset="1">
                <Select v-model="userInfo.health">
                    <Option :value="0" :key="0">——请选择——</Option>
                </Select>
            </Col>

            </Col>
            <Col span="7" offset="1">
                <Form label-position="left">
                    <FormItem label="毕业院校系及专业">
                        <div style="display: inline-block;">
                            <Input v-model="userInfo.zhuanchang" />
                           
                        </div>
                    </FormItem>
                </Form>
            </Col>
            <Col span="4">
                 <Input v-model="userInfo.zhuanchang" />
            </Col>
        </Row>
        <Row>
            <Col span="23" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="现任职务">
                        <Input v-model="userInfo.zhuanchang" style="width: 100%"/>
                    </FormItem>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col span="11" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="通信地址">
                        <Input v-model="userInfo.zhuanchang" style="width: 100%"/>
                    </FormItem>
                    <FormItem label="任务特长">
                        <Input v-model="userInfo.zhuanchang" style="width: 100%"/>
                    </FormItem>
                </Form>
            </Col>
            <Col span="11" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="手　机">
                        <Input v-model="userInfo.zhuanchang" style="width: 100%"/>
                    </FormItem>
                    <FormItem label="名单类别">
                        <RadioGroup v-model="userInfo.mindanCategory">
                            <Radio label="大名单"></Radio>
                            <Radio label="中名单"></Radio>
                            <Radio label="小名单"></Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col span="23" offset="1">
                <Form :label-width="85" label-position="left">
                    <FormItem label="简　历">
                        <Table size="small" 
                            stripe 
                            border 
                            disabled-hover 
                            :columns="columnList1" 
                            :data="dataList1"></Table>
                    </FormItem>
                    <FormItem label="奖惩情况">
                        <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                    </FormItem>
                    <FormItem label="年度考核结果">
                        <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                    </FormItem>
                    <FormItem label="家庭主要成员及重要社会关系">
                        <Table size="small" 
                            stripe 
                            border 
                            disabled-hover
                            :columns="columnList2"
                            :data="dataList2"></Table>
                    </FormItem>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col span="23" offset="1">
                <Button type="primary">保存</Button>
                <Button type="ghost">取消</Button>
            </Col>
        </Row>
    </Card>
</template>

<script>

const initUser = {
    health: 0
};

export default {
    name: 'ufuser-list',
    components: {
    },
        data () {
        return {
            userInfo :{},
            fullHeight: window.innerHeight,
            columnList1:[
                {
                    "title": "开始时间",
                    "key": "startDate",
                    "width": 200
                },
                {
                    "title": "结束时间",
                    "key": "endDate",
                    "width": 200
                },
                {
                    "title": "内容",
                    "key": "content"
                },
                {
                    "title": "操作",
                    "key": "operation",
                    "width": 100,
                    "align": "center",
                    "fixed": "right"
                }
            ],
            columnList2:[
                {
                    "title": "称　谓",
                    "key": "chengwei",
                    "width": 120
                },
                {
                    "title": "姓　名",
                    "key": "xingming",
                    "width": 120
                },
                {
                    "title": "出生年月",
                    "key": "birthday",
                    "width": 140
                },
                {
                    "title": "政治面貌",
                    "key": "zhengzhimianmao"
                },
                {
                    "title": "工作单位及职务",
                    "key": "companyandtitle"
                },
                {
                    "title": "操作",
                    "key": "operation",
                    "width": 100,
                    "align": "center",
                    "fixed": "right",
                    "handle": ['delete']
                }
            ],
            dataList1:[
                {
                    startDate: "2018年8月"
                }
            ],
            dataList2:[
                {
                    birthday: "2018年8月1日"
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
    computed : {
        minHeight () {
            return this.fullHeight - 120 + 'px'
        }
    }
}
</script>