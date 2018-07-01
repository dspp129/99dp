<template>
    <Row class="margin-top-20" type="flex" justify="center">
        <Form label-position="right" :label-width="70"
            ref="value"
            :model="value" 
            :rules="ruleScheduler">
            <FormItem label="创建人">
                <Select v-model="value.ownerId" style="width:100px">
                    <Option v-for="user in userList" :value="user.id" :key="user.id">{{user.trueName}}</Option>
                </Select>
            </FormItem>
            <FormItem label="任务名称" prop="name" required>
                <Input style="width: 280px;"
                    v-model.trim="value.name"
                    @on-change="onChange"
                    :icon="icon">
                </Input>
            </FormItem>
            <FormItem label="任务描述">
                <Input style="width: 280px;" type="textarea" v-model.trim="value.schedulerDesc" :autosize="{minRows: 5}"></Input>
            </FormItem>
        </Form>

    </Row>
</template>

<script>

import ChooseTable from './chooseTable'

export default{
    name: 'task-1',
    components : {
        ChooseTable
    },
    props: {
        value : Object,
        userList: Array
    },
    data () {
        const validateName = (rule, value, callback) => {
            if (value.length === 0) {
                callback(new Error('请输入任务名称'));
                return
            }

            this.getRequest(`/scheduler/checkName?taskName=${value}&id=${this.value.id}`).then(res=>{
                const result = res.data
                if(result.code === 0){
                    this.icon = 'checkmark'
                    this.value.nameIsValid = true
                    callback();
                } else {
                    this.icon = 'close'
                    this.value.nameIsValid = false
                    callback(new Error(result.msg))
                }
            })
        }

        const validateAlertEmail = (rule, value, callback) => {
            if(value.length === 0){
                callback(new Error('请输入邮箱'));
                return
            }
            const reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$")
            if (!reg.test(value)) {
                callback(new Error('请输入合法邮箱'));
            }
        }

        return {
            icon: '',
            
            ruleScheduler: {
                name: [{ validator: validateName, trigger: 'blur' }]
            //    alertEmail: [{ validator: validateAlertEmail, trigger: 'blur' }]
            },
        }
    },
    methods: {
        onChange() {
            this.icon = ''
            this.value.nameIsValid = false
        },
    },
    created () {
    },
    mounted () {
    },
    computed : {
    }

}


</script>