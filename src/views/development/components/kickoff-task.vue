<template>
    <Modal v-model="showing"
        width="500"
        :mask-closable="false"
        :closable="false"
        class-name="modal-vertical-center">
        <p slot="header" style="color:#ff9900;text-align:center">
            <Icon type="help-circled"></Icon>
            <span>手动执行任务</span>
        </p>
        <Row type="flex" justify="center" align="middle" class="margin-top-10">
            <Col span="12" align="right">
                <RadioGroup v-model="execType">
                    <Radio label="immediate">
                        <span>立即执行</span>
                    </Radio>
                    <Radio label="planned">
                        <span>计划执行</span>
                    </Radio>
                </RadioGroup>
            </Col>
            <Col span="12">
                <DatePicker 
                type="datetime" 
                :disabled="execType === 'immediate'"
                :options="options"
                v-model="selectDateTime"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择日期时间" 
                style="width: 180px"></DatePicker>
            </Col>
        </Row>

        <Row type="flex" justify="center" align="middle" class="margin-top-20">
            <Col span="12" align="center">
                参数列表
            </Col>
        </Row>

        <Row type="flex" justify="center" align="middle" class="margin-top-10">

            <Form ref="formDynamic" :model="formDynamic" :label-width="0" style="width: 390px">
                <FormItem
                        v-for="(item, index) in formDynamic.items"
                        :key="index"
                        :prop="'items.' + index + '.key'"
                        :rules="{required: true, message: '　　　变量名不能为空', trigger: 'blur'}">
                    <Row>
                        <Col span="24">
                            <span style="width:30px;float: left;text-align: center;">&nbsp;</span>
                            <Input type="text" v-model.trim="item.key" style="width:150px;float: left;"></Input>
                            <span style="width:30px;float: left;text-align: center;">=</span>
                            <Input type="text" v-model.trim="item.value" style="width:150px;float: left;"></Input>
                            <Button size="small" type="error" shape="circle" icon="minus-round" @click="handleRemove(index)" style="margin-left: 5px;"></Button>
                        </Col>
                    </Row>
                </FormItem>
                <FormItem>
                    <Row>
                        <Col span="24">
                            <span style="width:30px;float: left;text-align: center;">&nbsp;</span>
                            <Button type="dashed" @click="handleAdd" style="width:150px;float: left;">
                                <Icon type="plus-round"></Icon>&nbsp;&nbsp;新增变量
                            </Button>
                            <span style="width:30px;float: left;text-align: center;">=</span>
                            <Button type="dashed" @click="handleAdd" style="width:150px;float: left;">
                                <Icon type="plus-round"></Icon>&nbsp;&nbsp;新增变量
                            </Button>
                            <span style="width:30px;float: left;text-align: center;">&nbsp;</span>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
        </Row>

        <div slot="footer">
            <Button type="ghost" shape="circle" icon="close-round" @click="close"></Button>
            <Button type="success" shape="circle" icon="paper-airplane" @click="kick" :disabled="runnable" :loading="submitting"></Button>
        </div>
    </Modal>

</template>

<script>


const initParams = [
    {
        key:'${startDate}',
        value: moment().add(-1, 'days').format('YYYY-MM-DD'),
        index: 1
    },
    {
        key:'${endDate}',
        value: moment().add(0, 'days').format('YYYY-MM-DD'),
        index: 2
    }
]

import moment from 'moment';
import Util from '@/libs/util';

export default {
    name: 'kickoffTask',
    components: {
    },
    props: {
        value: Boolean,
        id: Number
    },
    data () {
        return {
            showing: false,
            submitting: false,
            index: 1,
            fireTime: '',
            params: '',
            selectDateTime: new Date(),
            execType: 'immediate',
            formDynamic: {
                items: []
            },
            options: {
                disabledDate (date) {
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            }
        };
    },
    methods: {
        kick () {
            if(this.execType !== 'immediate'){
                const date = Util.formatDateTime(this.selectDateTime)
                if(date === '— —'){
                    this.$Message.error('时间格式有误，请重新输入。')
                    return;
                }
                this.fireTime = date
            } else {
                this.fireTime = Util.formatDateTime(new Date())
            }

            if(this.formDynamic.items.length === 0) {
                this.params = ''
                this.sendJob()
                return;
            }

            this.params = encodeURI(JSON.stringify(this.formDynamic.items.map(e => { return {key:e.key,value:e.value}})))

            this.$refs.formDynamic.validate((valid) => {
                if (valid) {
                    this.sendJob()
                } else {
                    this.$Message.error('请输入合理的变量名。')
                }
            })
        },

        sendJob() {
            this.submitting = true
            this.postRequest(`/task/run?jobId=${this.id}&fireTime=${this.fireTime}&params=${this.params}`).then(res=>{
                const result = res.data;
                if(result.code === 0){
                    setTimeout(() => {
                        this.submitting = false
                        this.$Loading.finish()
                        this.$Message.success('操作成功');
                        this.close()
                    }, 1000);
                } else {
                    this.submitting = false
                    this.$Loading.error()
                    this.$Message.error(result.msg);
                }
            })
        },
        handleAdd () {
            this.index++;
            this.formDynamic.items.push({
                key:'',
                value: '',
                index: this.index
            });
        },
        handleRemove (index) {
            this.formDynamic.items.splice(index, 1);
        },
        close () {
            this.$emit('input', false)
            this.$refs.formDynamic.resetFields()
        }
    },
    mounted () {

    },
    computed : {
        runnable(){
            if(this.execType === 'immediate' || this.selectDateTime !== ''){
                return false
            } else {
                return true
            }
        }
    },
    watch : {
        value (value) {
            this.execType = 'immediate'
            this.selectDateTime = new Date()
            this.formDynamic.items = JSON.parse(JSON.stringify(initParams))
            this.showing = value
        }
    }
}


</script>