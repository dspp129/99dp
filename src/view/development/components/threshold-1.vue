<template>
  <Row :gutter="10">
    <Col span="14">
      <Card dis-hover icon="md-code-working" title="SQL详情" :style="{minHeight}">
        <div slot="extra">
          <Tooltip transfer placement="top" class="margin-left-10">
            <div slot="content">
              <p>为避免返回数据量过大</p>
              <p>请添加 rownum 或 limit 关键字</p>
            </div>
            <Button ghost
              size="small"
              type="primary"
              icon="md-play"
              :loading="running"
              :disabled="!runnable"
              @click="runQuery">测试</Button>
          </Tooltip>
        </div>
        <Row>
          <Select transfer
            v-model="value.dbType"
            placeholder="数据库类型..."
            @on-change="changeDbType"
            style="width: 120px">
            <Option v-for="item in dbTypeList" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>

          <Select transfer
            clearable
            ref="connection"
            v-model="value.connectionId"
            placeholder="请选择数据库连接..."
            class="margin-left-10"
            style="width: 180px" >
            <Option v-for="item in connectionList" v-if="item.dbType === value.dbType" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
        </Row>
        <Row class="margin-top-10 editor-round">
          <SqlEditor ref="SqlEditor" v-model="value.sqlStatement" :height="editorHeight"/>
        </Row>
      </Card>
    </Col>

      <Modal
        v-model="showingWindow"
        fullscreen
        :closable="false"
        :scrollable="true">

        <!--
            <Button size="small" type="primary">邮件试发</Button>
        -->
        <div v-html="returnTable"></div>
        <Button slot="footer" @click="showingWindow = false">关闭</Button>
          <!--
            <Table stripe
            :columns="columnList"
            :data="dataList"
            size="small"></Table>
          -->
      </Modal>

    <Col span="10">
      <Card dis-hover icon="md-code-working" title="监控规则" :style="{minHeight}">
        <Alert type="warning" show-icon>仅当产生运行结果时发送邮件</Alert>
        <Row type="flex" justify="center" align="middle" class="margin-top-40">
          <Form :label-width="80" @submit.native.prevent>
            <FormItem label="监控属性">
              <RadioGroup v-model="value.alertType">
                <Radio :label="1">质量控制</Radio>
                <Radio :label="2">外部监控</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="报警频率">
              <InputNumber :max="999" :min="0" v-model="value.frequency"></InputNumber>
              <span>&nbsp;分钟</span>
              <Tooltip placement="top" class="margin-left-10">
                <div slot="content">
                  <p>相邻两次报警的最短间隔时间</p>
                </div>
                <Button shape="circle" icon="md-help" size="small"/>
              </Tooltip>
            </FormItem>
            <FormItem label="发送形式">
              <RadioGroup v-model="value.alertMode">
                <Radio :label="1">仅正文</Radio>
                <Radio :label="2">仅附件</Radio>
                <Radio :label="3">正文+附件</Radio>
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
                style="width: 200px;" />
            </FormItem>
          </Form>
        </Row>
      </Card>
    </Col>
  </Row>
</template>

<script>

import SqlEditor from '_c/sql-editor'
import * as taskApi from '@/api/task'

export default {
  name: 'threshold-1',
  components: {
    SqlEditor
  },
  props: {
    value: Object
  },
  data () {
    return {
      running: false,
      showingWindow: false,

      dbTypeList: this.$store.state.user.dbTypeList,
      connectionList: this.$store.state.user.connectionList,

      columnList: [],
      dataList: [],
      returnTable: ''
    }
  },
  methods: {
    async runQuery () {
      this.running = true
      const result = await taskApi.runQuery(this.value)
      this.running = false
      if (result.code === 0) {
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
    },
    changeDbType () {
      this.$refs.connection.clearSingleSelect()
    }
  },
  mounted () {
    document.body.ondrop = function (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  created () {
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 205 + 'px'
    },
    editorHeight () {
      return this.$store.state.app.fullHeight - 335
    },
    runnable () {
      return this.value.sqlStatement.toLowerCase().indexOf('rownum') > 0 ||
             this.value.sqlStatement.toLowerCase().indexOf('limit') > 0 ||
             this.value.sqlStatement.toLowerCase().indexOf('top') > 0
    }
  },
  watch: {
    'value.id' (id) {
      this.$refs.SqlEditor.resize()
    }
  }
}
</script>
