<template>
  <Editor v-model="sqlText"
    @init="initEditor"
    lang="sql"
    theme="tomorrow"
    :height="height"
    :width="width">
  </Editor>
</template>

<script>

import Editor from 'vue2-ace-editor'

require('brace/ext/searchbox')
require('brace/ext/language_tools') // language extension prerequsite...
require('brace/mode/sql')
require('brace/theme/tomorrow')
require('brace/snippets/text')
require('brace/snippets/sql') // snippet

export default {
  name: 'sql-editor',
  components: {
    Editor
  },
  props: {
    value: String,
    height: true,
    width: true,
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      editor: Object,
      sqlText: ''
    }
  },
  methods: {
    initEditor (editor) {
      this.sqlText = this.value
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        readOnly: this.readonly
      })
      editor.setShowPrintMargin(false)
      editor.resize()
      this.editor = editor
    },
    resize () {
      this.editor.resize()
    },
    focus () {
      this.editor.focus()
    }
  },
  mounted () {
    this.$emit('init', this.editor)
  },
  watch: {
    sqlText (sql) {
      this.$emit('input', sql)
    },
    value (val) {
      this.sqlText = val
    },
    readonly (readOnly) {
      this.editor.setOptions({ readOnly })
    }
  }
}
</script>
