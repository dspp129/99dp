<template>
    <Row class="margin-top-20" type="flex" justify="center">
        <Form label-position="right" :label-width="70"
            ref="value"
            :model="value" 
            :rules="ruleScheduler">
            <FormItem label="创建人">
                <Select v-model="value.ownerId" style="width:100px" @on-change="onBlur">
                    <Option v-for="user in userList" :value="user.id" :label="user.trueName" :key="user.id"></Option>
                </Select>
            </FormItem>
            <FormItem label="任务名称" required prop="name">
                <Input style="width: 255px"
                    v-model.trim="value.name"
                    @on-blur="onBlur"
                    @on-change="onChange"
                    :icon="icon">
                </Input>
            </FormItem>
            <FormItem label="接警邮箱" prop="alertEmail">
                <Input v-model.trim="value.alertEmail" icon="ios-email-outline" placeholder="多邮箱请用逗号分隔" style="width: 255px" @on-blur="onBlur"></Input>
            </FormItem>
            <FormItem label="任务描述">
                <Input style="width: 255px;" type="textarea" v-model.trim="value.schedulerDesc" :autosize="{minRows: 3,maxRows: 5}" @on-blur="onBlur"></Input>
            </FormItem>
        </Form>
    </Row>
</template>

<script>

import Cookies from 'js-cookie';

export default{
    name: 'task-1',
    props: {
        value : Object
    },
    data () {
        const validateName = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入任务名称'));
                return
            }

            this.$http.get('/api/scheduler/checkName?taskName=' + value).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.icon = 'checkmark'
                    this.value.nameIsValid = true
                    callback();
                } else {
                    this.icon = 'close'
                    this.value.nameIsValid = false
                    callback(new Error(result.data.msg))
                }
            })
        }

        const validateAlertEmail = (rule, value, callback) => {
            if(value === ''){
                callback()
                return
            }
            const reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$")
            if (!reg.test(value)) {
                callback(new Error('请输入合法邮箱'));
            }
        }

        return {
            icon: '',
            userList: [],
            
            ruleScheduler: {
                name: [{ validator: validateName, trigger: 'blur' }],
                alertEmail: [{ validator: validateAlertEmail, trigger: 'blur' }]
            },
        }
    },
    methods: {
        onBlur () {
            // this.$emit('on-desc-change')
        },
        onChange() {
            this.icon = ''
            this.value.nameIsValid = false
        }
    },
    mounted () {
        this.$http.get('/api/task/userList').then(res=>{
            const result = res.data
            if(result.code === 0){
                this.userList = result.data
                const userId = Cookies.get('userId')
                this.value.ownerId = Number(userId)
            }
        })

        if(this.value.alertEmail === ''){
            const userName = Cookies.get('user')
            this.value.alertEmail = userName + '@99Bill.com'
        }
    }

}


</script>