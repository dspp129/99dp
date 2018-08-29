<template>
    <Row :gutter="10" class="margin-top-10">
        <Col span="16">
            <Card icon="code-working" title="SQL详情">
                <div slot="extra">
                    <Tooltip transfer placement="top" class="margin-left-10">
                        <div slot="content">
                            <p>为避免返回数据量过大</p>
                            <p>请添加 rownum 关键字</p>
                        </div>
                        <Button size="small" type="primary" icon="play" :disabled="!runnable" :loading="running" @click="runSql">运行</Button>
                    </Tooltip>
                    <Modal
                        v-model="showingWindow"
                        :closable="false"
                        class-name="modal-vertical-center"
                        :scrollable="true"
                        width="auto">
                        <div v-html="returnTable"></div>
                        <Button slot="footer" @click="showingWindow = false">关闭</Button>
                        <!--
                        <Table stripe 
                        :columns="columnList" 
                        :data="dataList"
                        size="small"></Table>
                        -->
                    </Modal>
                <!--
                    <Button size="small" type="primary">邮件试发</Button>
                -->
                </div>
                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%;">
                    <SqlEditor v-model="value.sqlStatement" :height="editorHeight"></SqlEditor>
                </div>
            </Card>
        </Col>
        <Col span="8">
            <Card icon="code-working" title="监控规则" :style="{minHeight}">
                <Alert type="warning" show-icon>仅当有运行结果时才会发送邮件</Alert>
                <Row type="flex" justify="center" align="middle" class="margin-top-40">
                    <Form :label-width="80">
                        <FormItem label="监控属性">
                            <RadioGroup v-model="value.alertType">
                                <Radio :label="1">对内监控</Radio>
                                <Radio :label="2">外部需求</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="报警频率">
                            <InputNumber :max="999" :min="0" v-model="value.frequency"></InputNumber>
                            <span>分钟</span>
                            <Tooltip placement="top" class="margin-left-10">
                                <div slot="content">
                                    <p>相邻两次报警的最短间隔时间</p>
                                </div>
                                <Button shape="circle" icon="help" type="ghost" size="small"></Button>
                            </Tooltip>
                        </FormItem>
                        <FormItem label="发送形式">
                            <RadioGroup v-model="value.alertMode">
                                <Radio :label="1">仅正文</Radio>
                                <Radio :label="2" disabled>仅附件</Radio>
                                <Radio :label="3" disabled>正文+附件</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="邮件标题" required>
                            <Input v-model="value.emailSubject" 
                                icon="ios-email-outline"
                                style="width: 200px;">
                            </Input>
                        </FormItem>
                        <FormItem label="邮箱列表" required>
                            <Input v-model="value.emailAddress" 
                                type="textarea" 
                                :autosize="true" 
                                placeholder="多邮箱请用逗号或换行分隔"
                                style="width: 200px;">
                            </Input>
                        </FormItem>
                        <FormItem label="邮件正文">
                            <Input v-model="value.emailContent" 
                                type="textarea" 
                                :autosize="{minRows: 2,maxRows: 5}"
                                style="width: 200px;">
                            </Input>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        </Col>
    </Row>
</template>

<script>

import Util from '@/libs/util';
import SqlEditor from '@/views/my-components/sql-editor';

export default {
    name: 'threshold-1',
    components: {
        SqlEditor
    },
    props : {
        value : Object
    },
    data () {
        return {
            running: false,
            showingWindow: false,
            columnList: [],
            dataList: [],
            returnTable : ''
        };
    },
    methods : {
        runSql(){
            this.running = true
            this.postRequest(`/task/runSql`, this.value).then(res => {
                const result = res.data
                this.running = false
                if(result.code === 0){
                    /*
                    this.dataList = result.data.rows
                    this.columnList = result.data.columns.map(e => {
                        return {
                            key: e,
                            title: e,
                            ellipsis: true
                        }
                    })
                    */
                    this.returnTable = result.data
                    this.showingWindow = true
                } else {
                    this.$Message.error(result.msg)
                }
            })
        }
    },
    mounted () {
        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
    },
    computed : {
        minHeight () {
            return window.innerHeight - 245 + 'px'
        },
        editorHeight () {
            return window.innerHeight - 333;
        },
        runnable(){
            return this.value.sqlStatement.toLowerCase().indexOf('rownum') > 0
        }
    },
    watch : {
        'value.id' (id) {
            
        }
    }
};
</script>

