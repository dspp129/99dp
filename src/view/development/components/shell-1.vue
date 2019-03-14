<template>
  <Row :gutter="10" class="margin-top-10">
    <Col>
      <Card dis-hover icon="md-code-working" title="Shell详情" :style="{minHeight}">
        <Input v-model="command" type="textarea" :autosize="{minRows: 10}" />
      </Card>
    </Col>
  </Row>
</template>

<script>

export default {
  name: 'shell-1',
  props: {
    value: String
  },
  data () {
    return {
      command: this.value
    }
  },
  computed: {
    minHeight () {
      return this.$store.state.app.fullHeight - 205 + 'px'
    }
  },
  watch: {
    value (value) {
      this.command = value
    },
    command (value) {
      this.$emit('input', value)
    }
  }
}
</script>
