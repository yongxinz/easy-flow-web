<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="listQuery" :model="listQuery" :inline="true">
        <el-form ref="listQuery" :model="listQuery" :inline="true">
          <WorkOrderSearch :genre="'my-create'" @handleSearch="handleSearch" />
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
              v-permisaction="['process:list:myCreate:select']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleView(scope.row)"
            >查看</el-button>
            <el-button
              v-permisaction="['process:list:myCreate:reopen']"
              size="mini"
              type="text"
              icon="el-icon-refresh-right"
              @click="handleReopen(scope.row.id)"
            >重开</el-button>
            <el-button
              v-if="scope.row.is_end===0"
              v-permisaction="['process:list:upcoming:urge']"
              size="mini"
              type="text"
              icon="el-icon-alarm-clock"
              @click="handleUrge(scope.row)"
            >催办</el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { workOrderList, urgeWorkOrder, reopenWorkOrder } from '@/api/ticket/ticket'

// 搜索
import WorkOrderSearch from './components/search/index'
export default {
  components: { WorkOrderSearch },
  data() {
    return {
      users: [],
      nodeList: [],
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
      this.listQuery.category = 2
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
    handleReopen(id) {
      this.$confirm('根据此工单新建一个新的工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        reopenWorkOrder(id).then(res => {
          this.getList()
          this.$message({
            type: 'success',
            message: '成功!'
          })
        })
      })
    },
    handleSelectionChange() {},
    handleUrge(row) {
      this.$confirm('<span style="font-size:15px ">对此工单处理人进行催办通知提醒, 是否继续?</span><br><span style="color: #c33; font-size: 10px">注意：十分钟内只能催办一次。</span>', '催办', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        urgeWorkOrder({
          ticket_id: row.ticket_id
        }).then(response => {
          this.$message({
            type: 'success',
            message: '已进行催办通知!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
