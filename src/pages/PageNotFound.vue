<template>
    <div class="col-full" :class="$style.centered">
        <h1 :class="$style.headingLarge">Not Found</h1>
        <p :class="$style.textLarge"> Ooops you broke the internet. Go <router-link :to="{name: 'Home'}">Home</router-link> lol</p>
    </div>
</template>
<script>
export default {
    created(){
        this.$emit('ready')
    }
}
</script>
<style module>
    .headingLarge {
        font-size:100px;
    }
    .textLarge {
        font-size:50px;
        font-weight: 100;
    }
    .centered {
        text-align: center;
    }
</style>