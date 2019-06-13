<template>
  <Row type="flex" justify="center" :style="{alignItems: 'center' , minHeight}">
    <Form ref="form"
      :label-width="90"
      :model="value"
      :rules="ruleScheduler"
      label-position="right"
      @submit.native.prevent>
      <FormItem label="创建人">
        <Select v-model="value.userId" style="width:100px">
          <Option v-for="user in userList" :value="user.id" :key="user.id">{{user.realName}}</Option>
        </Select>
      </FormItem>
      <FormItem label="任务名称" prop="jobName">
        <Input style="width: 280px;"
          v-model.trim="value.jobName"
          @on-change="onChange"
          :icon="icon">
        </Input>
      </FormItem>
      <FormItem label="主题域" required>
        <Select v-model.number="value.categoryId" style="width:200px" @on-change="changeCategory">
          <Option v-for="item in categoryList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          <Option :value="-1" :key="-1"><i>增加新主题...</i></Option>
        </Select>
        <Button v-if="value.categoryId > 0" shape="circle" icon="md-create" type="text" @click="editCategory"/>
      </FormItem>
      <FormItem label="数据层" required>
        <Select v-model.number="value.subCategoryId" style="width:200px" @on-change="changeSubCategory">
          <Option v-for="item in subCategoryList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          <Option :value="-1" :key="-1"><i>增加新数据层...</i></Option>
        </Select>
        <Button v-if="value.subCategoryId > 0" shape="circle" icon="md-create" type="text" @click="editSubCategory"/>
      </FormItem>
      <FormItem label="任务描述">
        <Input style="width: 280px;" type="textarea" v-model.trim="value.comment" :autosize="{minRows: 10}" />
      </FormItem>
    </Form>
    <Modal
      v-model="modal"
      :title="title"
      :loading="loading"
      @on-ok="confirmCategoryName"
      class-name="modal-vertical-center category">
      <Form ref="category" :model="category" :rules="rules" :label-width="120" @submit.native.prevent class="margin-top-20">
        <FormItem label="名称" prop="name">
          <Input v-model="category.name" placeholder="请输入名称" autofocus @on-enter="confirmCategoryName" style="width: 300px;"/>
        </FormItem>
        <FormItem label="描述" prop="description">
          <Input v-model="category.description" type="textarea" placeholder="描述信息" :autosize="{minRows: 5}" style="width: 300px;"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="closeModal"/>
        <Button ghost type="success" shape="circle" icon="md-checkmark" @click="confirmCategoryName" :loading="loading" :disabled="!valid" />
      </div>
    </Modal>
  </Row>
</template>

<script>

import * as taskApi from '@/api/task'

export default {
  name: 'task-desc',
  props: {
    value: Object
  },
  data () {
    const validateTaskName = async (rule, value, callback) => {
      const data = {
        name: value,
        id: this.value.jobId
      }
      const result = await taskApi.checkTaskName(data)
      if (result.code === 0) {
        this.nameIsValid = true
        callback()
      } else {
        this.nameIsValid = false
        callback(new Error(result.msg))
      }
    }

    const validateCategoryName = async (rule, value, callback) => {
      const result = await taskApi.checkCategoryName(this.category)
      if (result.code === 0) {
        this.valid = true
        callback()
      } else {
        this.valid = false
        callback(new Error(result.msg))
      }
    }

    return {
      categoryList: [],
      subCategoryList: [],


      modal: false,
      loading: false,
      title: '',
      valid: false,
      rules: {
        name: [
          { required: true, message: '分类名称不能为空', trigger: 'change' },
          { validator: validateCategoryName, trigger: 'blur' }
        ]
      },

      category: {
        id: 0,
        parentId: 0,
        name: '',
        description: ''
      },

      nameIsValid: false,
      userList: this.$store.state.user.userList,
      ruleScheduler: {
        jobName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { validator: validateTaskName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async init () {
      this.categoryList = await this.findCategoryByParentId(0)
    },
    onChange () {
      this.nameIsValid = null
    },
    validate () {
      return this.$refs.form.validate()
    },
    async changeCategory (id) {
      this.value.subCategoryId = 0
      if (typeof id !== 'undefined' && id > 0) {
        this.subCategoryList = await this.findCategoryByParentId(id)
        return
      }
      this.value.categoryId = 0
      this.category = {
        id: 0,
        name: '',
        parentId: 0,
        description: ''
      }
      this.title = '添加主题域'
      this.modal = true
    },
    changeSubCategory (id) {
      if (id === -1) {
        this.value.subCategoryId = 0
        this.category = {
          id: 0,
          name: '',
          parentId: this.value.categoryId,
          description: ''
        }
        this.title = '添加数据层'
        this.modal = true
      }
    },
    editCategory () {
      this.title = '修改主题域'
      this.category = JSON.parse(JSON.stringify(this.categoryList.find(el => el.id === this.value.categoryId)))
      this.modal = true
    },
    editSubCategory () {
      this.title = '修改数据层'
      this.category = JSON.parse(JSON.stringify(this.categoryList.find(el => el.id === this.value.subCategoryId)))
      this.modal = true
    },
    async confirmCategoryName () {
      if (this.category.name === '') return
      // const result = await this.$refs.category.validateField('name')
      this.loading = true
      const result = await taskApi.saveCategory(this.category)
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.$Message.success('操作成功')
      this.closeModal()
      if (this.category.parentId > 0) {
        this.value.subCategoryId = result.data.id
        this.subCategoryList = await this.findCategoryByParentId(this.category.parentId)
      } else {
        this.value.categoryId = result.data.id
        this.categoryList = await this.findCategoryByParentId(0)
      }
    },
    async findCategoryByParentId (id) {
      const result = await taskApi.findCategoryByParentId(id)
      if (result.code === 0) {
        return result.data
      } else {
        this.$Message.error(result.msg)
        return []
      }
    },
    closeModal () {
      this.modal = false
      this.loading = false
      this.$refs.category.resetFields()
    }
  },
  created () {
  },
  mounted () {
    this.init()
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 80 + 'px'
    },
    icon () {
      if (this.value.jobName === '') return ''
      if (this.nameIsValid === null) return ''
      if (this.nameIsValid) return 'md-checkmark'
      else return 'md-close'
    }
  },
  watch: {
    'value.jobId' () {
    },
    nameIsValid (valid) {
      this.$emit('on-change-name', valid)
    }
  }
}

</script>


<style lang="less">
.category .ivu-modal-header{
    border-bottom-width: 0px;
}

</style>

