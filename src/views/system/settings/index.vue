<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>配置信息</span>
      </div>
      <div class="text item">
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="120px">
          <el-form-item label="系统名称：" prop="name">
            <el-input v-model="ruleForm.name" />
          </el-form-item>
          <el-form-item label="系统Logo：" prop="logo">
            <el-upload
              class="avatar-uploader"
              :action="url"
              :data="{type:'1'}"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="ruleForm.logo" :src="ruleForm.logo" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
          <el-form-item label="验证码：">
            <el-radio v-model="ruleForm.is_verify_code" :label="true">是</el-radio>
            <el-radio v-model="ruleForm.is_verify_code" :label="false">否</el-radio>
          </el-form-item>
          <el-form-item style="margin-bottom: 0">
            <el-button v-permisaction="['system:settings:index:config']" type="primary" @click="submitForm('ruleForm', 1)">确定</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { setSettings, getSettings } from '@/api/system/settings'
export default {
  components: {

  },
  data() {
    return {
      url: process.env.VUE_APP_BASE_API + '/api/v1/public/uploadFile',
      editable: [],
      ruleForm: {
        name: '',
        logo: '',
        is_ldap: false,
        is_verify_code: true
      },
      rules: {
        name: [
          { required: true, message: '请输入系统名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '请设置Logo', trigger: 'blur' }
        ]
      },
      tableData: []
    }
  },
  created() {
    this.getSettingsInfo()
  },
  methods: {
    getSettingsInfo() {
      getSettings().then(response => {
        for (var v of response.data) {
          if (v.classify === 1) {
            if (v.content === undefined || v.content === null) {
              this.ruleForm = {
                name: '',
                logo: ''
              }
            } else {
              this.ruleForm = v.content
            }
          } else if (v.classify === 2) {
            if (v.content === undefined || v.content === null) {
              this.tableData = []
            } else {
              this.tableData = v.content
            }
          }
        }
      })
    },
    // 提交配置信息
    submitForm(formName, classify) {
      var requestStatus = false
      var jsonValue = {
        classify: classify
      }
      if (classify === 1) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            jsonValue.content = this.ruleForm
            requestStatus = true
          }
        })
      } else if (classify === 2) {
        jsonValue.content = this.tableData
        requestStatus = true
      }
      if (requestStatus) {
        setSettings(jsonValue).then(response => {
          this.$store.dispatch('settings/getSystemSettings')
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      }
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleAvatarSuccess(res, file) {
      this.ruleForm.logo = res.data
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isLt2M
    },
    chengenum(row, status) { // 我的方法
      this.editable[row] = status
      this.$set(this.editable, row, status)
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
