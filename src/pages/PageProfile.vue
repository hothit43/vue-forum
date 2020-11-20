<template>
  <div class="flex-grid">
    <UserProfileCard
      v-if="!edit"
      :user="user"
    />
    <UserProfileCardEditor
      v-else
      :user="user"
    />

    <div class="col-7 push-top">
      <div class="profile-header">
        <span class="text-lead">
            {{user.username}}'s recent activity
        </span>
        
      </div>

      <hr>
      <PostList v-if="!isempty" :posts="userPosts"/>
    </div>
  </div>
</template>

<script>
    import PostList from '@/components/PostList'
    import UserProfileCard from '@/components/UserProfileCard'
    import UserProfileCardEditor from '@/components/UserProfileCardEditor'
    import {mapGetters} from 'vuex'
    import asyncDataStatus from '@/mixins/asyncDataStatus'

    export default {
      components: {
        PostList,
        UserProfileCard,
        UserProfileCardEditor
      },
    
      data(){
        return {
          isempty: false
        }
      },

      mixins: [asyncDataStatus],

      props: {
        edit: {
          type: Boolean,
          default: false
        }
      },

      computed: {
        ...mapGetters({
          user: 'auth/authUser'
        }),

        userPosts () {
          return this.$store.getters['users/userPosts'](this.user['.key'])
        }
      },
      created () {
        if(this.user.posts){
          this.$store.dispatch('posts/fetchPosts', {ids: this.user.posts})
            .then(() => this.asyncDataStatus_fetched())
        } else {
          this.isempty = true
          this.$emit('ready')
        }
      }
    }
</script>

<style scoped>

</style>