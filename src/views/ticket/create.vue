<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>公共信息</span>
      </div>
      <div class="text item">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" />
      </div>
    </el-card>

    <el-card
      class="box-card"
      style="margin-top: 10px"
    >
      <div
        slot="header"
        class="clearfix"
      >
        <span>表单信息</span>
      </div>
      <div class="text item">
        <template v-for="(tplItem, tplIndex) in template">
          <fm-generate-form
            v-show="currentNode.hideTpls===undefined ||
              currentNode.hideTpls===null ||
              currentNode.hideTpls.indexOf(tplItem.id)===-1"
            :key="tplIndex"
            :ref="'generateForm-'+tplItem.id"
            :preview="currentNode.hideTpls===undefined ||
              currentNode.hideTpls===null ||
              currentNode.hideTpls.indexOf(tplItem.id)===-1?false:true"
            :remote="remoteFunc"
            :data="tplItem.FormStructure"
            :disabled="currentNode.readonlyTpls===undefined ||
              currentNode.readonlyTpls===null ||
              currentNode.readonlyTpls.indexOf(tplItem.id)===-1?null:true"
          />
        </template>
      </div>
      <hr style="background-color: #d9d9d9; border:0; height:1px;">
      <div
        class="text item"
        style="text-align: center;margin-top:18px"
      >
        <el-button
          v-for="(item, index) in processStructureValue.edges"
          v-show="item.source===processStructureValue.nodes[active].id"
          :key="index"
          type="primary"
          :disabled="submitDisabled"
          @click="submitAction(item)"
        >
          {{ item.label }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>

import Vue from 'vue'
import {
  GenerateForm
} from '@/components/VueFormMaking'
import 'form-making/dist/FormMaking.css'
Vue.component(GenerateForm.name, GenerateForm)

import {
  processStructure,
  createWorkOrder
} from '@/api/ticket/ticket'
import { listUser } from '@/api/system/sysuser'
import { getDeptList } from '@/api/system/dept'
export default {
  name: 'Create',
  data() {
    return {
      submitDisabled: false,
      active: 0,
      processInfo: {},
      processStructureValue: {},
      template: [],
      currentNode: {},
      ruleForm: {
        process_id: '',
        classify_id: '',
        state: [],
        source: '',
        source_state: '',
        process_method: '',
        template: {
          'form_structure': [],
          'form_data': []
        },
        tasks: []
      },
      rules: {},
      remoteFunc: {
        // 获取用户列表
        async userList(resolve) {
          const res = await listUser({
            pageSize: 999999
          })
          const options = res.data.list
          resolve(options)
        },
        async deptTreeList(resolve) {
          const res = await getDeptList()
          resolve(res.data)
        }
      }
    }
  },
  created() {
    this.getProcessNodeList()
  },
  methods: {
    getProcessNodeList() {
      processStructure({
        processId: this.$route.query.processId
      }).then(response => {
        this.processInfo = JSON.parse(response.data.process)
        this.processStructureValue = JSON.parse(this.processInfo.Structure)
        console.log(this.processInfo)
        console.log(this.processStructureValue)
        this.template = JSON.parse(response.data.template)
        for (var i = 0; i < this.template.length; i++) {
          this.template[i].FormStructure = JSON.parse(this.template[i].FormStructure)
        }
        this.currentNode = this.processStructureValue.nodes[0]
      })
    },
    submitAction(item) {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          this.submitDisabled = true
          var stateMap = {}
          this.ruleForm.process_id = parseInt(this.$route.query.processId)
          this.ruleForm.classify_id = this.processInfo.Classify
          stateMap['id'] = item.target
          this.ruleForm.source_state = this.processStructureValue.nodes[this.active].label
          for (var v of this.processStructureValue.nodes) {
            if (v.id === item.target) {
              if (v.assignType !== undefined) {
                stateMap['process_method'] = v.assignType
              }
              if (v.assignValue !== undefined) {
                stateMap['processor'] = Array.from(new Set(v.assignValue))
              }
              stateMap['label'] = v.label
              break
            }
          }
          this.ruleForm.state = [stateMap]

          this.ruleForm.template = {
            'form_structure': [],
            'form_data': []
          }
          // 绑定流程任务
          this.ruleForm.tasks = this.processInfo.task === undefined ? [] : JSON.parse(this.processInfo.task)
          // 追加节点任务
          if (this.processStructureValue.nodes[this.active].task !== undefined && this.processStructureValue.nodes[this.active].task.length > 0) {
            for (var task of this.processStructureValue.nodes[this.active].task) {
              if (this.ruleForm.tasks.indexOf(task) === -1) {
                this.ruleForm.tasks.push(task)
              }
            }
          }

          var promiseList = []
          for (var tpl of this.template) {
            tpl.FormStructure.id = tpl.id
            this.ruleForm.template.form_structure.push(tpl.FormStructure)
            promiseList.push(this.$refs['generateForm-' + tpl.id][0].getData())
          }
          Promise.all(promiseList).then(values => {
            this.ruleForm.source = this.processStructureValue.nodes[this.active].id
            this.ruleForm.template.form_data = values
            this.ruleForm.is_exec_task = item.isExecuteTask

            this.ruleForm.state = JSON.stringify(this.ruleForm.state)
            this.ruleForm.tasks = JSON.stringify(this.ruleForm.tasks)
            this.ruleForm.template = JSON.stringify(this.ruleForm.template)
            createWorkOrder(this.ruleForm).then(response => {
              if (response.code === 200) {
                this.$router.push({ path: '/process/upcoming' })
              }
            }).catch(() => {
              this.submitDisabled = false
            })
          }).catch(() => {
            this.submitDisabled = false
          })
        }
      })
    }
  }
}
</script>
