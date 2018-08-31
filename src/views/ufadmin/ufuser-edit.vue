<style lang="less">
    @import '../../styles/common.less';
</style>
<style>

.span-label-auto {
    display: inline-block;
    width: auto;
    margin-left: 20px;
    margin-right: 10px;
}

.span-label-short {
    display: inline-block;
    width: 75px;
    margin-left: 20px;
}

.span-label-middle {
    display: inline-block;
    width: 90px;
    margin-left: 20px;
}

.span-label-long {
    display: inline-block;
    width: 110px;
    margin-left: 20px;
}

.span-value-auto {
    display: inline-block;
    width: auto;
}

.span-value-short {
    display: inline-block;
    width: 110px;
}

.span-value-middle {
    display: inline-block;
    width: 210px;
}

.span-value-long {
    display: inline-block;
    width: 270px;
}

.example-header {
    font-weight: 500;
    margin: 10px 0 10px;
    position: relative;
    display: block;
    -webkit-font-smoothing: antialiased;
}

.example-header:before {
    content: "";
    display: block;
    width: 100%;
    height: 1px;
    background: #eee;
    position: relative;
    top: 10px;
    left: 0;
}

*, :after, :before {
    box-sizing: border-box;
}

</style>
<template>
    <Card :style="{minHeight}">
        <Spin size="large" fix v-if="showSpin"></Spin>
        <Tabs type="card" :animated="false">
            <TabPane label="基本信息" name="name1">

                <header class="example-header">
                    <span>基本信息</span>
                </header>

                <div style="display: inline-block;">
                    <div style="float: left;">
                        <div class="margin-top-10">
                            <span class="span-label-short">姓　　名</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.realname" />
                            </span>
                            <span class="span-label-short">外语姓名</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.englishname" />
                            </span>
                            <span class="span-label-short">曾 用 名</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.nickyname" />
                            </span>
                            <span class="span-label-short">出生年月</span>
                            <span class="span-value-short">
                                <DatePicker type="date" v-model="userInfo.birthday" transfer />
                            </span>
                        </div>

                        <div class="margin-top-10">
                            <span class="span-label-short">性　　别</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.xingbie" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">国　　籍</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.guoji" />
                            </span>
                            <span class="span-label-short">籍　　贯</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.jiguan" />
                            </span>
                            <span class="span-label-short">出 生 地</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.chushengdi" />
                            </span>
                        </div>

                        <div class="margin-top-10">
                            <span class="span-label-short">民　　族</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">婚姻状况</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">健康情况</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">港澳台列表</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                        </div>

                        <div class="margin-top-10">
                            <span class="span-label-short">外语语种</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">宗教信仰</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                        <Option value="1">男</Option>
                                        <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-label-short">宗教称谓</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.chushengdi" />
                            </span>
                            <span class="span-label-short">教　　名</span>
                            <span class="span-value-short">
                                <Input v-model="userInfo.chushengdi" />
                            </span>
                        </div>

                        <div class="margin-top-10">
                            <span class="span-label-short">身份证件一</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.xingbie" transfer >
                                    <Option value="1">男</Option>
                                    <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-value-middle">
                                <Input v-model="userInfo.idcard1" />
                            </span>
                            <span class="span-label-short">身份证件二</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                    <Option value="1">男</Option>
                                    <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-value-middle">
                                <Input v-model="userInfo.idcard1" />
                            </span>
                        </div>

                        <div class="margin-top-10">
                            <span class="span-label-short">身份证件三</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.xingbie" transfer >
                                    <Option value="1">男</Option>
                                    <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-value-middle">
                                <Input v-model="userInfo.idcard1" />
                            </span>
                            <span class="span-label-short">身份证件四</span>
                            <span class="span-value-short">
                                <Select v-model="userInfo.nationId" transfer >
                                    <Option value="1">男</Option>
                                    <Option value="2">女</Option>
                                </Select>
                            </span>
                            <span class="span-value-middle">
                                <Input v-model="userInfo.idcard1" />
                            </span>
                        </div>
                    </div>
                    <div style="float: left;">
                        <div class="margin-top-10 margin-left-10">
                            <Upload
                                ref="upload"
                                :show-upload-list="false"
                                :on-success="handleSuccess"
                                :format="['jpg','jpeg','png']"
                                :max-size="2048"
                                :on-format-error="handleFormatError"
                                type="drag"
                                action="//jsonplaceholder.typicode.com/posts/"
                                style="display: inline-block;width:58px;">
                                <div style="width: 58px;height:58px;line-height: 58px;">
                                    <Icon type="camera" size="20"></Icon>
                                </div>
                            </Upload>
                        </div>
                    </div>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-auto">
                        是否取得国(境)外永久居留权
                    </span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-auto">
                        取得国(境)外永久居留权国家(地区)名称
                    </span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                    <span class="span-label-middle">离开大陆时间</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">现任社会职务</span>
                    <span class="span-value-long">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                    <span class="span-label-middle">参加工作年月</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                    <span class="span-label-middle">档案管理单位</span>
                    <span class="span-value-long">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">党　　派</span>
                    <span class="span-value-long">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">加入年月</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                    <span class="span-label-middle">党派内职务</span>
                    <span class="span-value-long">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">第二党派</span>
                    <span class="span-value-long">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">加入年月</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                    <span class="span-label-middle">党派内职务</span>
                    <span class="span-value-long">
                        <Input v-model="userInfo.chushengdi" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">党派培养方向</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">是否后备干部</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-middle">是否市管干部</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-auto">是否市委委员、候补委员</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-middle">是否纪委委员</span>
                    <span class="span-value-auto">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">人物类别</span>
                    <span class="span-value-long">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">人物代表性</span>
                    <span class="span-value-long">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">所属部队</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">所属领域</span>
                    <span class="span-value-middle">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                    <span class="span-label-middle">与我部密切度</span>
                    <span class="span-value-middle">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                        </Select>
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">人物禁忌</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">人物特长</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">人物爱好</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <header class="example-header">
                    <span>学历及职称信息</span>
                </header>

                <div class="margin-top-10">
                    <span class="span-label-long">全日制学历</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-long">全日制学位</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">毕业院校</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-auto">专业</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-long">全日制第二学历</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-long">全日制第二学位</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">毕业院校</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-auto">专业</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-long">在职学历</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-long">在职学位</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">毕业院校</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-auto">专业</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-long">在职第二学历</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-long">在职第二学位</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">毕业院校</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-auto">专业</span>
                    <span class="span-value-short">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-long">中国科学院院士</span>
                    <span class="span-value-short">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-long">当选院士时间</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                    <span class="span-label-long">中国工程院院士</span>
                    <span class="span-value-short">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-middle">当选院士时间</span>
                    <span class="span-value-short">
                        <DatePicker type="date" v-model="userInfo.birthday" transfer />
                    </span>
                </div>


                <div class="margin-top-10">
                    <span class="span-label-long">博士生导师</span>
                    <span class="span-value-short">
                        <Checkbox v-model="userInfo.checkbox"></Checkbox>
                    </span>
                    <span class="span-label-long">政府特殊津贴</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                            <Option value="1">男</Option>
                            <Option value="2">女</Option>
                            <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">技术职称</span>
                    <span class="span-value-short" style="width: 160px;">
                        <Select v-model="userInfo.xingbie" transfer >
                            <Option value="1">男</Option>
                            <Option value="2">女</Option>
                            <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                    <span class="span-label-short">职称级别</span>
                    <span class="span-value-short">
                        <Select v-model="userInfo.xingbie" transfer >
                            <Option value="1">男</Option>
                            <Option value="2">女</Option>
                            <Option value="3">硕士研究生</Option>
                        </Select>
                    </span>
                </div>

                <header class="example-header">
                    <span>备注信息</span>
                </header>

                <div class="margin-top-10">
                    <span class="span-label-auto" style="width: 950px;" >
                        <Input v-model="userInfo.comment" type="textarea" :autosize="{minRows: 3,maxRows: 5}"></Input>
                    </span>
                </div>

            </TabPane>
            <TabPane label="综合情况" name="name2">

                <Row>
                    <Col span="22" offset="1">
                        <Form :label-width="85" label-position="left">
                            <FormItem label="简　历">
                                <EditableTable 
                                    :columns="resumeColumnList" 
                                    v-model="resumeDataList"></EditableTable>
                            </FormItem>
                            <FormItem label="主要表现">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                            <FormItem label="政治台服">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                            <FormItem label="年度考核结果">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                            <FormItem label="培训情况">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                            <FormItem label="主要成就及社会影响">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                            <FormItem label="工作业绩及获奖情况">
                                <Input v-model="userInfo.jiangcheng" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"></Input>
                            </FormItem>
                        </Form>
                    </Col>
                </Row>

            </TabPane>
            <TabPane label="学习及工作情况" name="name3">
                <header class="example-header">
                    <span>学习信息</span>
                </header>

                <EditableTable 
                    :columns="studySituationColumnList" 
                    v-model="studySituationDataList"></EditableTable>

                <div class="margin-top-20"></div>

                <header class="example-header">
                    <span>工作信息</span>
                </header>

                <EditableTable 
                    :columns="workSituationColumnList" 
                    v-model="workSituationDataList"></EditableTable>

            </TabPane>
            <TabPane label="联系信息" name="name4">


                <header class="example-header">
                    <span>本人常用联系情况</span>
                </header>

                <div class="margin-top-10">
                    <span class="span-label-middle">单位地址</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">邮政编码</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">工作电话</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">居住地址</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">邮政编码</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">住宅电话</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">电子邮箱</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">传　　真</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">手　　机</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>

                <div class="margin-top-10">
                    <span class="span-label-middle">网　　址</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">微博账号</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">微信账号</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                </div>


                <div class="margin-top-10">
                    <span class="span-label-middle">Facebook</span>
                    <span class="span-value-middle">
                        <Input v-model="userInfo.renwuleibie" />
                    </span>
                    <span class="span-label-middle">备　　注</span>
                    <span class="span-value-auto" style="width: 537px;">
                        <Input v-model="userInfo.renwuleibie" type="textarea" :autosize="{minRows: 2}"/>
                    </span>
                </div>

                <header class="example-header">
                    <span>日常联系人</span>
                </header>

                <EditableTable 
                    :columns="contactsColumnList" 
                    v-model="contactsDataList">
                </EditableTable>

            </TabPane>
            <TabPane label="家庭及社会关系" name="name5">
                <FamilyMemberTree  />
            </TabPane>
            <TabPane label="政治安排" name="name6">
                <ArrangementTree />
            </TabPane>
            <TabPane label="推荐情况" name="name7">标签三的内容</TabPane>
            <TabPane label="考察材料及人物简历" name="name8">标签三的内容</TabPane>
        </Tabs>

        <OperationBar 
            class="margin-top-20" 
            style="margin-left: 730px;"
            @on-delete="onDelete"
            @on-save="onSave"
            @on-cancel="onCancel"
            >
        </OperationBar>

    </Card>
</template>



<script>

import EditableTable from './components/editable-table'
import OperationBar from './components/operation-bar'
import FamilyMemberTree from './components/family-member-tree'
import ArrangementTree from './components/arrangement-tree'
import * as metadata from './data/metadata'

const initUser = {
    health: 0
};

export default {
    name: 'ufuser-edit',
    components: {
        EditableTable,
        OperationBar,
        FamilyMemberTree,
        ArrangementTree
    },
    data () {
        return {
            pageName: 'ufuser-edit',
            showSpin: false,  // 生产改true
            userInfo :{},
            userId: 0,

            fullHeight: window.innerHeight,
            resumeColumnList:[],
            resumeDataList:[{}],

            studySituationColumnList: [],
            studySituationDataList: [{}],

            workSituationColumnList: [],
            workSituationDataList: [{}],

            contactsColumnList: [],
            contactsDataList: [{}],

            treeList2:['人大职务','政协职务','海联会职务','社会职务'],
            treeNodeList2: []
        };
    },
    methods: {
        initMetaData () {
            this.contactsColumnList = metadata.contactsColumnList
            this.workSituationColumnList = metadata.workSituationColumnList
            this.studySituationColumnList = metadata.studySituationColumnList
            this.resumeColumnList = metadata.resumeColumnList
        },
        init () {
            this.userInfo = JSON.parse(JSON.stringify(initUser))
            const req = this.$route.params
            this.userId = req.id
        },
        getData(){
            this.showSpin = true
            this.getRequest(`/ufuser/${this.userId}`).then(res => {
                const result = res.data
                if(result.code === 0){
                    this.userInfo = result.data
                    this.showSpin = false
                } else {
                    this.$Notice.error({
                        title: result.msg,
                    });
                    this.closePage()
                }
            })
        },
        handleResize (event) {
            this.fullHeight = document.documentElement.clientHeight
        },
        save(){
            
        },
        handleSuccess (res, file) {
            file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar';
            file.name = '7eb99afb9d5f317c912f08b5212fd69a';
        },
        handleFormatError (file) {
            this.$Notice.warning({
                title: 'The file format is incorrect',
                desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
            });
        },
        onDelete () {
            this.$Message.success('删除成功')
            this.closePage()
        },
        onSave () {
            this.$Message.success('保存成功')
        },
        onCancel () {
            this.closePage()
        },
        closePage(){
            this.$store.commit('removeTag', this.pageName)
            this.$store.commit('closePage', this.pageName)
            this.$router.go(-1)
        },
    },
    activated () {
        this.init()
    },
    deactivated (){
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.handleResize)
    },
    mounted () {
        window.addEventListener('resize', this.handleResize)
    },
    created () {
        this.initMetaData();
    },
    computed : {
        minHeight () {
            return this.fullHeight - 120 + 'px'
        }
    },
    watch : {
        userId(id){
            if(id > 0){
                this.getData()
            }
        }
    }

}
</script>