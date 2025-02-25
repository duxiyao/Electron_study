<template>
  <div id="app">
    <label>
      <input
        type="checkbox"
        :value="被控端"
		@change="handleChange"
        v-model="isControlled"
      />
      设置为被控端
    </label>
	
    <div v-if="user.name">
      <h1>欢迎, {{ user.name }}!</h1>
      <button @click="clearUser">清除账号</button>
    </div>
    <div v-else>
      <div class="settings-content">
        <h2>设置用户名</h2>
        <input v-model="newName" placeholder="请输入您的名字" />
        <button @click="saveName">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const user = ref({ name: '',isControlled:false });
const newName = ref('');
const isControlled = ref(false);

window.electronAPI.onRefreshData((event, data) => {
  console.log('收到刷新数据的通知:', data);
  refreshData(data);
});

// 刷新数据的函数
function refreshData() {
  console.log('刷新页面数据...');
  // 在这里实现刷新数据的逻辑
}

// 获取用户数据
onMounted(async () => {
	try {
		let ret = await window.electronAPI.getUser();
		if(ret){
			user.value = ret
		}
	} catch (e) {
		console.log(e)
	}
});

const handleChange = async (event) => {
      isControlled.value = event.target.checked;
      console.log('isControlled 发生变化：', isControlled.value);
    };
	
const clearUser =async () => {
  let ret = await window.electronAPI.getUser();
  if(ret){ user.value.name='' }	
};

// 保存用户名
const saveName = async() => {
    if (newName.value.trim()) {
        user.value.name = newName.value;
        user.value.isControlled = isControlled.value;
        await window.electronAPI.saveUser(JSON.stringify(user.value));
    }
    console.log('isControlled=' + isControlled.value)
    //window.electronAPI.send('close-window', 1); // 假设窗口 ID 为 1

};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.settings-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>