<template>
  <div>
    <Row :gutter="10">
      <Col span="6">
        <Button type="dashed" long @click="addCategory"  icon="md-add" style="height: 315px;">添加分类</Button>
                
      </Col>
      <Col span="6">
        <Card title="大分类一">
          <div slot="extra">
            <Button shape="circle" icon="md-create" type="text" size="small" />
            <Button shape="circle" icon="md-add" type="text"   />
          </div>
          <chart-pie style="height: 230px;" :value="pieData"/>
        </Card>
      </Col>
      <Col span="6">
        <Card title="大分类三" style="height: 315px;">
          <div slot="extra">
            <Button shape="circle" icon="md-create" type="text" size="small" />
            <Button shape="circle" icon="md-add" type="text" />
          </div>
          <Badge :count="100">
          	<Tag closable color="primary" @on-change="onChangeTag">primary</Tag>
          </Badge>
          <Badge :count="70" class="margin-left-20 margin-top-10">
          	<Tag closable color="success">success</Tag>
          </Badge>
          <Badge :count="7" class="margin-left-20 margin-top-10">
          	<Tag closable color="error">error (33)</Tag>
          </Badge>
          <Badge :count="1" class="margin-left-20 margin-top-10">
          	<Tag closable color="warning">warning (31)</Tag>
          </Badge>
          <Badge :count="21" class="margin-left-20 margin-top-10">
          	<Tag closable color="magenta">magenta (23)</Tag>
          </Badge>
          <Tag closable color="red">red (13)</Tag>
          <Tag closable color="volcano">volcano (3)</Tag>
          <Tag closable color="orange">orange (3)</Tag>
          <Tag closable color="gold">gold (3)</Tag>
          <Tag closable color="yellow">yellow (3)</Tag>
        </Card>
      </Col>
    </Row>

    <Modal
      v-model="modal"
      title="添加大分类"
      :loading="loading"
      @on-ok="confirmCategoryName"
      class-name="modal-vertical-center category">
      <Form ref="category" :model="category" :rules="rules" :label-width="120" @submit.native.prevent>
        <FormItem label="分类名称" prop="name">
          <Input v-model="category.name" placeholder="请输入分类名称" autofocus @on-enter="confirmCategoryName" style="width: 300px;"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button shape="circle" icon="md-close" @click="closeModal"/>
        <Button ghost type="success" shape="circle" icon="md-checkmark" @click="confirmCategoryName" :loading="loading" />
      </div>
    </Modal>

  </div>
</template>

<script>

import * as homeApi from '@/api/home'
import { ChartPie, ChartBar } from '_c/charts'

export default {
  name: 'home',
  components: {
    ChartPie,
    ChartBar
  },
  data () {
    const validateCategoryName = async (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        callback(new Error('The two input passwords do not match!'))
      }
    }

    return {
      modal: false,
      loading: false,
      rules: {
        name: [
        	{ required: true, message: '分类名称不能为空', trigger: 'change' },
          { validator: validateCategoryName, trigger: 'none' }
        ]
      },

      category: {
        name: ''
      },
      pieData: [],
      barData: []
    }
  },
  methods: {
    async init () {
      const result = await homeApi.getHomeData()
      this.pieData = [
        { name: '小分类1', value: result.data.etlTask },
        { name: '小分类12', value: result.data.sqlTask },
        { name: '小分类13', value: result.data.shellTask },
        { name: '小分类14', value: result.data.thresholdTask },
        { name: '小分类5', value: result.data.miniReport }
      ]
      this.barData = result.data.oneWeekRecords
    },
    confirmCategoryName () {
    	if (this.category.name === '') return
      this.loading = true
      this.$refs.category.validateField('name')
      setTimeout(() => {
          this.loading = false
      }, 2000)
    },

    addCategory () {
      this.modal = true
    },
    closeModal () {
      this.modal = false
      this.loading = false
      this.$refs.category.resetFields()
    },
    onChangeTag (data) {
    	console.log(data)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="less">
.category .ivu-modal-header{
    border-bottom-width: 0px;
}

</style>
