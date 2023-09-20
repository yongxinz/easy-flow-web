<template>
  <div class="app-container">
    <div v-if="isLoadingStatus" />
    <div v-else>
      <el-card class="box-card">
        <div class="text item">
          <el-steps
            v-if="currentNode.clazz !== undefined && currentNode.clazz !== null && currentNode.clazz !== ''"
            :active="activeIndex"
            finish-status="success"
          >
            <template v-for="(item, index) in nodeStepList">
              <el-step
                v-if="item.isHideNode === false ||
                  item.isHideNode === undefined ||
                  item.isHideNode == null ||
                  item.id === ticket.current_state"
                :key="index"
                :title="item.label"
              />
            </template>
          </el-steps>
          <div v-else>
            <el-alert
              show-icon
              title="未找到当前工单流程信息，请确认当前工单绑定的流程是否存在。"
              type="warning"
            />
          </div>
        </div>
      </el-card>

      <el-alert
        v-if="activeIndex !== nodeStepList.length && ticket.isEnd===1"
        style="margin-top: 15px"
        :title="alertMessage"
        type="error"
        :closable="false"
      />

      <el-card
        class="box-card"
        style="margin-top: 15px;"
      >
        <div
          slot="header"
          class="clearfix"
        >
          <span>表单信息</span>
        </div>
        <div class="text item">
          <template v-for="(tplItem, tplIndex) in ticketData">
            <fm-generate-form
              v-show="currentNode.hideTpls===undefined ||
                currentNode.hideTpls===null ||
                currentNode.hideTpls.indexOf(tplItem.FormStructure.id)===-1"
              :key="tplIndex"
              :ref="'generateForm-'+tplItem.id"
              :preview="!!((currentNode.hideTpls!==undefined &&
                currentNode.hideTpls!==null &&
                currentNode.hideTpls.indexOf(tplItem.FormStructure.id)!==-1) ||
                (currentNode.writeTpls===undefined ||
                currentNode.writeTpls===null ||
                currentNode.writeTpls.indexOf(tplItem.FormStructure.id)===-1)||
                (isActiveProcessing && currentNode.activeOrder))"
              :remote="remoteFunc"
              :value="tplItem.FormData"
              :data="tplItem.FormStructure"
            />
          </template>
        </div>
        <div v-if="ticket.userAuthority">
          <hr style="background-color: #d9d9d9; border:0; height:1px; margin-bottom: 15px">
          <div>
            <el-input
              v-model="remark"
              type="textarea"
              placeholder="请输入备注信息"
              maxlength="200"
              :autosize="{ minRows: 3, maxRows: 99}"
              show-word-limit
            />
          </div>
          <div
            class="text item"
            style="text-align: center;margin-top:18px"
          >
            <div v-if="isActiveProcessing && currentNode.activeOrder">
              <el-button
                v-permisaction="['process:list:handle:active']"
                type="primary"
                @click="activeOrderActive"
              >
                主动接单
              </el-button>
            </div>
            <div v-else>
              <template v-for="(item, index) in edges">
                <el-button
                  v-if="ticket.IsEnd===0 && item.source===currentNode.id"
                  :key="index"
                  type="primary"
                  @click="submitAction(item)"
                >
                  {{ item.label }}
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </el-card>

      <el-card
        class="box-card"
        style="margin-top: 15px"
      >
        <div
          slot="header"
          class="clearfix"
        >
          <span>工单流转历史</span>
        </div>
        <div class="text item">
          <el-table
            :data="circulationHistoryList"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="State"
              label="节点"
            />
            <el-table-column
              prop="Circulation"
              label="流转"
            />
            <el-table-column
              prop="HandlerName"
              label="处理人"
            />
            <el-table-column
              prop="CreateAt"
              label="处理时间"
            />
            <el-table-column
              prop="Remark"
              label="备注"
            />
          </el-table>
        </div>
      </el-card>
    </div>
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
  handleWorkOrder,
  activeOrder
} from '@/api/ticket/ticket'

import { listUser } from '@/api/system/sysuser'

import { mapGetters } from 'vuex'
import { getDeptList } from '@/api/system/dept'
export default {
  data() {
    return {
      isLoadingStatus: true,
      currentNode: {
        hideTpls: null,
        writeTpls: null
      },
      isActiveProcessing: false,
      tpls: [],
      remark: '', // 备注信息
      alertMessage: '',
      nodeStepList: [],
      circulationHistoryList: [],
      ticket: {},
      process: {},
      ticketData: {},
      nodes: [],
      edges: [],
      activeIndex: 0,
      processStructureValue: {
        workOrder: { title: '' }
      },
      ruleForm: {
        title: '',
        process: '',
        classify: '',
        state_id: '',
        state: '',
        source_state: '',
        processor: '',
        process_method: '',
        tpls: [],
        tasks: []
      },
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
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  created() {
    this.getProcessNodeList()
  },
  methods: {
    getProcessNodeList() {
      processStructure({
        processId: this.$route.query.processId,
        ticketId: this.$route.query.ticketId
      }).then(response => {
        this.isActiveProcessing = false
        this.processStructureValue = response.data
        this.circulationHistoryList = JSON.parse(response.data.circulation)
        this.nodes = JSON.parse(response.data.nodes)
        this.edges = JSON.parse(response.data.edges)
        this.process = JSON.parse(response.data.process)
        this.ticket = JSON.parse(response.data.ticket)
        for (var i = 0; i < this.ticket.length; i++) {
          this.ticket[i].State = JSON.parse(this.ticket[i].State)
        }
        this.ticketData = JSON.parse(response.data.form_data)
        for (i = 0; i < this.ticketData.length; i++) {
          this.ticketData[i].FormData = JSON.parse(this.ticketData[i].FormData)
          this.ticketData[i].FormStructure = JSON.parse(this.ticketData[i].FormStructure)
        }
        // 获取当前展示节点列表
        this.nodeStepList = []
        if (this.nodes) {
          for (i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === this.ticket.current_state) {
              // 当前节点
              this.nodeStepList.push(this.nodes[i])
              this.activeIndex = this.nodeStepList.length - 1
              if (i + 1 === this.nodes.length) {
                this.activeIndex = this.nodeStepList.length
              }
              this.currentNode = this.nodes[i]
            } else if (!this.nodes[i].isHideNode) {
              // 非隐藏节点
              this.nodeStepList.push(this.nodes[i])
            }
          }
        }

        // 如果回退到初始节点则可编辑。
        if (this.activeIndex === 0 && this.currentNode.clazz === 'start') {
          this.currentNode.writeTpls = []
          for (var tplTmp of this.ticketData) {
            this.currentNode.writeTpls.push(tplTmp.FormStructure.id)
          }
        }

        // 判断是否需要主动处理
        for (var stateValue of this.ticket.State) {
          if (this.ticket.current_state === stateValue.id && stateValue.processor.length > 1) {
            this.isActiveProcessing = true
            break
          }
        }
        this.isLoadingStatus = false
        this.getAlertMessage()

        console.log(this.currentNode)
      })
    },
    submitAction(item) {
      handleWorkOrder({
        flow_properties: item.flowProperties === undefined ? 2 : parseInt(item.flowProperties),
        ticket_id: parseInt(this.$route.query.ticketId),
        remark: this.remark
      }).then(response => {
        if (response.code === 200) {
          this.getProcessNodeList()
        }
      })
    },
    // 获取提示消息
    getAlertMessage() {
      if (this.ticket.isEnd === 1) {
        this.alertMessage = '当前工单已结束。'
      }
    },
    activeOrderActive() {
      var jsonData = [{
        id: this.nodeStepList[this.activeIndex].id,
        label: this.nodeStepList[this.activeIndex].label,
        process_method: 'person',
        processor: [this.userId]
      }]
      activeOrder(jsonData, this.$route.query.ticketId).then(() => {
        this.getProcessNodeList()
      })
    }
  }
}
</script>
