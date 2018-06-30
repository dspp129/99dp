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
                <Input style="width: 255px"
                    v-model.trim="value.name"
                    @on-change="onChange"
                    :icon="icon">
                </Input>
            </FormItem>

            <FormItem label="目标表" prop="targetTableId" required>
                <Input readonly 
                        icon="edit"
                        v-model="targetTableFullName"
                        placeholder="请点击图标编辑..."
                        @on-click="showingModal = true">
                </Input>
            </FormItem>

            <FormItem label="接警邮箱" prop="alertEmail">
                <Input v-model.trim="value.alertEmail" icon="ios-email-outline" placeholder="多邮箱请用逗号分隔" style="width: 255px"></Input>
            </FormItem>

            <FormItem label="任务描述">
                <Input style="width: 255px;" type="textarea" v-model.trim="value.schedulerDesc" :autosize="{minRows: 3,maxRows: 5}"></Input>
            </FormItem>
        </Form>
        <ChooseTable title="编辑目标表"
            v-model="showingModal"
            :dbTypeList="dbTypeList"
            @onChooseTable="onChooseTable">
        </ChooseTable>
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
        targetDbName: String,
        targetTableName:  {
          type: String,
          default: ''
        },
        dbTypeList: Array,
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
            showingModal: false,
            
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
        onChooseTable (value) {
            this.$emit('onChangeTarget', value);
        }
    },
    created () {
    },
    mounted () {
    },
    computed : {
        targetTableFullName () {
            if(this.targetTableName.length > 0)
                return this.targetDbName + '.' + this.targetTableName
            else
                return ''
        }
    }

}


</script>