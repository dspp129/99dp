<template>
  <Row :gutter="10">
    <Col span="6">
      <Card dis-hover shadow :style="{minHeight}" title="角色列表">
      </Card>
    </Col>
    <Col span="18">
      <Card dis-hover shadow :style="{minHeight}">
        <Tabs type="card" :animated="false">
          <TabPane label="角色与权限">
          </TabPane>
          <TabPane label="角色与用户">
          </TabPane>
        </Tabs>
      </Card>
    </Col>
  </Row>
</template>

<script>
export default {
  name: 'admin-role',
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight + 'px'
    }
  }
}
</script>
