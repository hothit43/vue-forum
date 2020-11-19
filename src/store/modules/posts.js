import Vue from 'vue'
import firebase from 'firebase'

export default {
  namespaced: true,

  state: {
    items: {}
  },

  actions: {
    createPost({commit, state, rootState}, post){
        //push is synchronous so key is returned imediately and stored in variable
        const postId = firebase.database().ref('posts').push().key
        post.userId = rootState.auth.authId
        post.publishedAt = Math.floor(Date.now()/1000)

        const updates = {}
        updates[`posts/${postId}`] = post
        updates[`threads/${post.threadId}/posts/${postId}`] = postId
        updates[`threads/${post.threadId}/contributors/${post.userId}`] = post.userId
        updates[`users/${post.userId}/posts/${postId}`] = postId

        //running code after firbase callback is complete can also be a callback -> updates, () => {}
        firebase.database().ref().update(updates)
            .then(() => {
                commit('setItem', {resource: 'posts', item: post, id:postId}, {root: true})
                commit('threads/appendPostToThread', {parentId: post.threadId, childId: postId}, {root: true})
                commit('threads/appendContributorsToThread', {parentId: post.threadId, childId: post.userId}, {root: true})
                commit('users/appendPostToUser', {parentId: post.userId, childId: postId}, {root: true})
                return Promise.resolve(state.items[postId])
            })


    },

    updatePost({state, commit, rootState}, {id, text}){
        return new Promise((resolve, reject) => {
            const post = state.items[id]
            const authUserId = rootState.auth.authId
          if(authUserId === post.userId){
              const edited = {
                at: Math.floor(Date.now()/1000),
                by: authUserId
            } 
            const updates = {text, edited}
            firebase.database().ref('posts').child(id).update(updates)  
                .then(() => {
                    commit('setPost', { postId: id, post: { ...post, text, edited }})
                    resolve(post)
                })
          } else {
            alert('This is not your post.')
            reject()
          }  
        });
   },

    fetchPost: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'posts', id, emoji: '💬'}, {root: true}),
    fetchPosts: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'posts', emoji: '💬', ids}, {root: true})
  },

  mutations: {
    setPost(state, {post, postId}){
        Vue.set(state.items, postId, post)
    }
  }
}