<template>
  <Row :gutter="10" class="margin-top-10">
    <Col>
      <Card dis-hover icon="md-code-working" title="Shell详情">
        <div class="editor-round">
          <ShEditor v-model="command" :height="editorHeight" />
        </div>
        <!--
        <Input v-model="command" type="textarea" :autosize="{minRows: 10}" />
        -->
      </Card>
    </Col>
  </Row>
</template>

<script>

import ShEditor from '_c/sh-editor'

export default {
  name: 'shell-1',
  components: {
    ShEditor
  },
  props: {
    value: String
  },
  data () {
    return {
      command: this.value
    }
  },
  computed: {
    editorHeight () {
      return this.$store.state.app.fullHeight - 295 + 'px'
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
