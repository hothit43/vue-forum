<template>
          <form @submit.prevent="save">
            <div class="form-group">
                <textarea
                name=""
                id=""
                cols="100"
                rows="10"
                class="form-input"
                v-model="text"
                >
                </textarea>
                <div class="form-actions">
                    <button v-if="isUpdate" @click.prevent="cancel" class="btn btn-ghost">Cancel</button>
                    <button class="btn-blue">
                        {{isUpdate ? 'Update Post' : 'Submit Post'}}
                    </button>
                </div>
            </div>
        </form>
</template>
<script>
import {mapActions} from 'vuex'
export default {
    props: {
        threadId: {
            required:false
        },
        post: {
            type: Object,
            validator: obj => {
                const keyIsValid = typeof obj['.key'] === 'string'
                const textIsValid = typeof obj.text === 'string'
                const valid = keyIsValid && textIsValid
                if(!valid){
                    console.error('The post prop object must contain a `.key` and a `text` attribute')
                }
                return valid
            }
        }
    },
    data(){
        return {
            text: this.post ? this.post.text : ''
        }
    },
    computed: {
        isUpdate(){
            return !!this.post
        }
    },
    methods: {
        ...mapActions('posts', ['createPost', 'updatePost']),
        save(event){
            this.persist()
            .then(post => {
                this.$emit('save', {post})
            })
        },
        cancel(){
            this.$emit('cancel')
        },
        create(){
            const post = {
                text: this.text,
                threadId: this.threadId
            }
            this.text = ''
            return this.createPost(post)     
        },
        update(){
            const payload  = {
                id: this.post['.key'],
                text: this.text
            }
            return this.updatePost(payload)
        },
        persist(){
            return this.isUpdate ? this.update() : this.create()
        }
    }
}
</script>
<style>
</style>