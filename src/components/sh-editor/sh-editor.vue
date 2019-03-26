<template>
  <Editor v-model="text"
    @init="initEditor"
    lang="sh"
    theme="tomorrow"
    :height="height"
    :width="width">
  </Editor>
</template>

<script>

import Editor from 'vue2-ace-editor'

require('brace/ext/searchbox')
require('brace/ext/language_tools') // language extension prerequsite...
require('brace/mode/sh')
require('brace/theme/tomorrow')
require('brace/snippets/text')
require('brace/snippets/sh') // snippet

export default {
  name: 'sh-editor',
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
      text: ''
    }
  },
  methods: {
    initEditor (editor) {
      this.text = this.value
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
    text (text) {
      this.$emit('input', text)
    },
    value (val) {
      this.text = val
    },
    readonly (readOnly) {
      this.editor.setOptions({ readOnly })
    }
  }
}
</script>
