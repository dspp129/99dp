<template>
    <Editor v-model="sqlText" 
        @init="initEditor" 
        lang="sql"
        theme="tomorrow"
        :height="height">
    </Editor>
</template>

<script>

import Editor from 'vue2-ace-editor';

require('brace/ext/searchbox')
require('brace/ext/language_tools') //language extension prerequsite...
require('brace/mode/sql')
require('brace/theme/tomorrow')
require('brace/snippets/text')
require('brace/snippets/sql') //snippet

export default {
    name: 'sql-editor',
    components: {
        Editor
    },
    props : {
        value: String,
        height : true
    },
    data () {
        return {
            editor: null,
            sqlText: ''
        };
    },
    methods : {
        initEditor (editor) {
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            editor.setShowPrintMargin(false);
            editor.resize()
            this.editor = editor
        }
    },
    mounted () {
        this.$emit('init', this.editor)
    },
    watch:{
        sqlText (sql) {
            this.$emit('input', sql)
        },
        value (val){
            this.sqlText = val
        }
    }
}
</script>