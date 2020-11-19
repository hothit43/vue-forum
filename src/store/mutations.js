import Vue from 'vue'
//Vue.set requires 3 arguments - Object to change, property name, property value

export default {
    setItem(state, {item, id, resource}){
        item['.key'] = id
        Vue.set(state[resource].items, id, item)
    }
}