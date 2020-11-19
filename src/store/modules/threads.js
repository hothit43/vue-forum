//global root state in index
//local state for each module
//vuex modules recieve local state as first argument in mutations and getters 
import {countObjectProperties} from '@/helpers'
import firebase from 'firebase'
import Vue from 'vue'
import {makeAppendChildToParentMutation} from '@/store/assetHelpers'

export default {
    namespaced: true,
    state: {
        //state.items.threads[id] -> common conventions: .items, .all, .cached
        //state.items.items[id]
        items: {} 
    },
    getters: {
        threadRepliesCount: state => id => countObjectProperties(state.items[id].posts) -1
    },
    actions: {
        createThread({state, commit, rootState}, {text, title, forumId}){
            return new Promise((resolve, reject) => {
                const userId = rootState.auth.authId
                const publishedAt = Math.floor(Date.now()/1000)
                const threadId = firebase.database().ref('threads').push().key
                const postId = firebase.database().ref('threads').push().key
                // const slug = this.title.replace(/\s+/g, '-').toLowerCase();
                const thread = {title, forumId, publishedAt, userId, firstPostId: postId, posts:{} }
                thread.posts[postId] = postId
                const post = {text, publishedAt, threadId, userId}
    
    
                const updates = {}
                //set thread
                updates[`threads/${threadId}`] = thread
                //append to forum
                updates[`forums/${forumId}/threads/${threadId}`] = threadId
                //append to user
                updates[`users/${userId}/threads/${threadId}`] = threadId
    
                updates[`posts/${postId}`] = post
               
                updates[`users/${userId}/posts/${postId}`] = postId
        
                //running code after firbase callback is complete can also be a callback -> updates, () => {}
                firebase.database().ref().update(updates)
                    .then(() => {
                        //update thread
                        commit('setItem', {resource: 'threads', item:thread, id:threadId}, {root: true})
                        commit('forums/appendThreadToForum', {parentId: forumId, childId: threadId}, {root: true})
                        commit('users/appendThreadToUser', {parentId: userId, childId: threadId}, {root: true})
                        
                        //update post
                        commit('setItem', {resource: 'posts', item: post, id:postId}, {root: true})
                        commit('appendPostToThread', {parentId: post.threadId, childId: postId})
                        commit('users/appendPostToUser', {parentId: post.userId, childId: postId}, {root: true})
            
                        resolve(state.items[threadId])
                    })
            })
        },
        updateThread({state, commit, rootState}, {text, title, id}){
            return new Promise((resolve, reject) => {
                const thread = state.items[id]
                const authUserId = rootState.auth.authId
                if(authUserId === thread.userId){
                    const post = rootState.posts.items[thread.firstPostId]
                    const edited = {
                        at: Math.floor(Date.now()/1000),
                        by: rootState.auth.authId
                    }
        
                    const updates = {}
                    updates[`posts/${thread.firstPostId}/text`] = text
                    updates[`posts/${thread.firstPostId}/edited`] = edited
                    updates[`threads/${id}/title`] = title
        
                    firebase.database().ref().update(updates)
                        .then(() => {
                            commit('setThread', {thread: {...thread, title}, threadId: id})
                            commit('posts/setPost', {postId: thread.firstPostId, post:{ ...post, text, edited}}, {root: true})
                            resolve(post)
                        })
                } else {
                    alert('This is not your post.')
                    reject()
                }       
            })
        },
        fetchThread: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'threads', id, emoji: '📓'}, {root:true}),
        fetchThreads: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'threads', emoji: '📓', ids}, {root: true}),
    },
    mutations: {
        setThread(state, {thread, threadId}){
            Vue.set(state.items, threadId, thread)
        },
        //makeAppendChildToParentMutation only updates the parent (thread) not the child (post)
        //appendPostToThread will only update thread
        appendPostToThread: makeAppendChildToParentMutation({parent: 'threads', child: 'posts'}),
        appendContributorsToThread: makeAppendChildToParentMutation({parent: 'threads', child: 'contributors'}),

    }
}