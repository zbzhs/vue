<template>
  <AdminLiveFollow
    v-if="liveOpsUser"
    :token="liveOpsUser.token"
    :account="liveOpsUser"
    @logout="handleLogout"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

import AdminLiveFollow from '../components/AdminLiveFollow.vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { liveOpsUser, logoutLiveOps } = useAuth()

function handleLogout() {
  logoutLiveOps()
  router.replace({ name: 'controlLogin' })
}
</script>
