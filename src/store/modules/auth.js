import firebase from 'firebase'
export default {
    namespaced: true,
    state: {
        authId: null,
        unsubscribeAuthObserver: null
    },
    getters: {
        authUser(state, getters, rootState){
            // create local user object, code that runs on all pages should be on root instance in main.js
            return state.authId ? rootState.users.items[state.authId] : null
        }
    },
    actions: {
        initAuthentication({dispatch, commit, state}){
            return new Promise((resolve, reject) => {
                //unsubscribe observer if already listening
                if(state.unsubscribeAuthObserver){
                    state.unsubscribeAuthObserver()
                }
    
                console.log('👣 the user has changed')
                const unsubscribe = firebase.auth().onAuthStateChanged( user => {
                    if(user){
                      dispatch('fetchAuthUser')
                        .then( dbUser => resolve(dbUser))
                    } else {
                        resolve(null)
                    }
                  }) 
                 
                 commit('setUnsubscribeAuthObserver', unsubscribe)
            })
        },
        
        registerUserWithEmailAndPassword({dispatch}, {email, name, username, password, avatar = null}){
            return firebase.auth().createUserWithEmailAndPassword(email, password)  
                    .then(userRecord => {
                        return dispatch('users/createUser', { id: userRecord.user.uid, email, name, username, password, avatar }, {root:true})
                            
                    })
                    .then(() => dispatch('fetchAuthUser'))
        },
        signInWithEmailAndPassword(context, {email, password}){
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signInWithGoogle({dispatch}){
            const provider = new firebase.auth.GoogleAuthProvider()
            return firebase.auth().signInWithPopup(provider)
                .then(data => {
                const user = data.user
                firebase.database().ref('users').child(user.uid).once('value', snapshot => {
                    if(!snapshot.exists()){
                        return dispatch('users/createUser', {id:user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL}, {root: true})
                                .then(() => dispatch('fetchAuthUser'))
                    }
                })
            })
        },
        signOut({commit}){
            return firebase.auth().signOut()
                    .then(() => {
                        commit('setAuthId', null)
                    })
        },
    
        fetchAuthUser({dispatch, commit}){
            const userId = firebase.auth().currentUser.uid
            return new Promise((resolve, reject) => {
                //check if user exists in database
                firebase.database().ref('users').child(userId).once( 'value', snapshot => {
                    if(snapshot.exists()){
                        return dispatch('users/fetchUser', {id: userId}, {root: true})
                        .then(user => {
                            commit('setAuthId', userId)
                            resolve(user)
                        })
                    } else {
                        resolve(null)
                    }
                })
            })
        }
    },
    mutations: {
        setAuthId(state, id){
            state.authId = id
        },
        setUnsubscribeAuthObserver(state, unsubscribe){
            state.setUnsubscribeAuthObserver = unsubscribe
        }
    }
}