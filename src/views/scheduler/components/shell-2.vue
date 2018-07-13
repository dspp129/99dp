<template>
    <Row :gutter="10" class="margin-top-10">
        <Col>
            <Card icon="code-working" title="Shell详情">

                <Input v-model="value.shell" type="textarea" :autosize="{minRows: 10}" ></Input>
                <!--
                <div style="border-radius:5px;border:1px solid #5cadff;width: 100%;">
                    <editor v-model="value.shell" 
                    @init="editorInit" 
                    lang="sql" 
                    theme="chrome"
                    width="100%"
                    :height="editorHeight"></editor>
                </div>
                -->
            </Card>
        </Col>
    </Row>
</template>

<script>

import editor from 'vue2-ace-editor';

export default {
    name: 'shell-2',
    components: {
        editor
    },
    props : {
        value : Object
    },
    data () {
        return {

        };
    },
    methods : {
        editorInit () {
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/sh')
            require('brace/mode/sql')
            require('brace/theme/chrome')
        }
    },
    computed : {
        editorHeight () {
            return window.innerHeight - 340 + 'px'
        }
    },
    mounted () {
    }
};
</script>

