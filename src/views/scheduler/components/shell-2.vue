<template>
    <Row :gutter="10" class="margin-top-10">
        <Col>
            <Card icon="code-working" title="Shell详情" :style="{minHeight}">

                <Input v-model="value.shell" type="textarea" :autosize="{minRows: 10}" ></Input>

               

                 <!--

                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%;">
                    <Editor v-model="value.shell" 
                    id="editor"
                    lang="sh" 
                    theme="tomorrow"
                    width="100%"
                    @init="initEditor"
                    :height="editorHeight"></Editor>
                </div>
                -->

                
            </Card>
        </Col>
    </Row>
</template>

<script>

import Editor from 'vue2-ace-editor';

export default {
    name: 'shell-2',
    components: {
        Editor
    },
    props : {
        value : Object
    },
    data () {
        return {
            editor:{}
        };
    },
    methods : {
        initEditor (editor) {
            require('brace/ext/searchbox')
            require('brace/mode/sh')
            require('brace/theme/tomorrow')
            require('brace/snippets/sh')
            require('brace/snippets/text')
            require('brace/ext/language_tools')

            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });

            editor.setShowPrintMargin(false)
            this.editor = editor

        },
        resizeEditor(){
            this.editor.resize();
        }
    },
    computed : {
        editorHeight () {
            return window.innerHeight - 340 + 'px'
        },
        minHeight () {
            return window.innerHeight - 245 + 'px'
        }
    },
    activated () {

    },
    mounted () {
    }
};
</script>

