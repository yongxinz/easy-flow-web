<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="listQuery" :model="listQuery" :inline="true">
        <el-form ref="listQuery" :model="listQuery" :inline="true">
          <WorkOrderSearch :genre="'related'" @handleSearch="handleSearch" />
        </el-form>
      </el-form>

      <el-table v-loading="loading" border :data="ticketList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" prop="ticket_id" width="120" />
        <el-table-column label="流程" prop="process_name" :show-overflow-tooltip="true" />
        <el-table-column label="当前状态" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>
              {{ scope.row.state_name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="当前处理人" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-if="scope.row.is_end===0">{{ scope.row.principals }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否结束" :show-overflow-tooltip="true" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_end===0" size="mini" type="success">否</el-tag>
            <el-tag v-else size="mini" type="danger">是</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
          <template slot-scope="scope">
            <el-button
              v-permisaction="['process:list:related:select']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleView(scope.row)"
            >查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        title="转交工单"
        :visible.sync="dialogVisible"
        width="30%"
      >
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="60px" class="demo-ruleForm">
          <el-form-item label="节点" prop="node_id">
            <el-select v-model="ruleForm.node_id" placeholder="选择节点" size="small" style="width: 100%">
              <el-option v-for="(item, index) in nodeList" :key="index" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户" prop="user_id">
            <el-select v-model="ruleForm.user_id" filterable placeholder="选择用户" size="small" style="width: 100%">
              <el-option v-for="(item, index) in users" :key="index" :label="item.nickName" :value="item.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="ruleForm.remarks" type="textarea" size="small" />
          </el-form-item>
          <el-form-item style="text-align: right">
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="dialogVisible = false">关闭</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageIndex"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { workOrderList } from '@/api/ticket/ticket'

// 搜索
import WorkOrderSearch from './components/search/index'

export default {
  components: { WorkOrderSearch },
  data() {
    return {
      users: [],
      nodeList: [],
      dialogVisible: false,
      queryParams: {},
      total: 0,
      loading: false,
      ticketList: [],
      listQuery: {
        pageIndex: 1,
        pageSize: 10
      },
      ruleForm: {
        work_order_id: '',
        node_id: '',
        user_id: '',
        remarks: ''
      },
      rules: {
        node_id: [
          { required: true, message: '请选择节点', trigger: 'change' }
        ],
        user_id: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.listQuery.pageIndex = this.queryParams.pageIndex
      this.listQuery.pageSize = this.queryParams.pageSize
      this.listQuery.category = 3
      workOrderList(this.listQuery).then(response => {
        this.ticketList = response.data.list
        this.queryParams.pageIndex = response.data.pageIndex
        this.queryParams.pageSize = response.data.pageSize
        this.total = response.data.count
        this.loading = false
      })
    },
    handleSearch(val) {
      for (var k in val) {
        this.listQuery[k] = val[k]
      }
      this.getList()
    },
    handleView(row) {
      this.$router.push({ name: 'ProcessListHandle', query: { ticketId: row.ticket_id, processId: row.process_id }})
    },
    handleSelectionChange() {}
  }
}
</script>

<style scoped>

</style>
