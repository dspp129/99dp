<template>
  <div>
    <vxe-table
      resizable
      size="small"
      :data="tableData"
      :tree-config="{children: 'children', expandAll: true}">
      <!--
      <vxe-table-column type="index" width="160" title="序号" tree-node/>
      -->
      <vxe-table-column field="title" title="显示名称" fixed="left" tree-node/>
      <vxe-table-column field="name" title="组件名称"/>
      <vxe-table-column field="component" title="组件路径"/>
      <vxe-table-column field="path" title="url路径"/>
      <vxe-table-column field="hideInBread" title="在面包屑中显示" width="120">
        <template v-slot="{ row, index }">
          <i-switch v-model="row.hideInBread" :true-value="false" :false-value="true" disabled/>
        </template>
      </vxe-table-column>
      <vxe-table-column field="hideInMenu" title="在菜单栏中显示" width="120">
        <template v-slot="{ row, index }">
          <i-switch v-model="row.hideInMenu" :true-value="false" :false-value="true" disabled/>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>

import * as adminApi from '@/api/admin'

export default {
  name: 'menu-tree',
  components: {
  },
  data () {
    return {
      tableData: []
    }
  },
  methods: {
    async getData () {
      const result = await adminApi.getAllMenu()
      if (result.code !== 0) {
        this.$Message.error(result.msg)
        return
      }
      this.tableData = result.data
    }
  },
  mounted () {
    this.getData()
  },
  created () {
  }
  
}
</script>