//---------------------------------------------------------------------------------------------------
//--------------------------WHAT DOES A DISPATCH RETURN?---------------------------------------------
//---------------------------------------------------------------------------------------------------

                          /*  Action Object passed in  */

let receiveProductsAC = products => ({
    type: RECEIVE_PRODUCTS,
    products
})

let receiveProductsActionObject=receiveProductsAC(products)
let mysteryDispatchReturnVal=store.dispatch( receiveProductsActionObject )

console.dir(mysteryDispatchReturnVal)
//  console.dir mysteryDispatchReturnVal, and you'll get something like this:
// {type: 'RECEIVE_PRODUCTS', products: [ /*array of products*/ ] }
//
// tldr: dispatch returns the action object itself, if that is what was passed in



                          /*  Thunk passed in  */

let uselessThunkCreator = () => {
  return function uselessthunk(){
    return 'Im a dumb thunk that just returns a useless string'
  }
}
let uselessthunk= uselessThunkCreator()
let mysteryDispatchReturnVal=store.dispatch(uselessthunk)

console.dir(mysteryDispatchReturnVal)
//  console.dir mysteryDispatchReturnVal, and you'll get this:
// 'Im a dumb thunk that just returns a useless string'

// tldr: dispatch returns whatever it is the thunk **returns**, if a thunk was passed in

//---------------------------------------------------------------------------------------------------
//--------------------------DISPATCH CAN RETURN A PROMISE--------------------------------------------
//---------------------------------------------------------------------------------------------------

                /*  Thunk passed in that returns a promise  */

let thunkthatdoesAsyncStuffCreator(some_id){
  return function thunkthatdoesAsyncStuff(dispatch){
    return axios.get(`/api/some_needed_thing/?some_needed_id=${some_id}`)
      .then(res=>{
        let someNeededData=res.data
        dispatch(someotherthing(someNeededData))
      })
    }
}

let thunkthatdoesAsyncStuff = thunkthatdoesAsyncStuffCreator(1)
let mysteryDispatchReturnVal=store.dispatch(thunkthatdoesAsyncStuff)

console.dir(mysteryDispatchReturnVal)
//  console.dir mysteryDispatchReturnVal, and you'll see a PROMISE instance, because axios.get(...).then is
// a promise!  So the value returned from dispatching the thunk is that same promise.



                  /*  You can dot then off this dispatch  */

let thunkthatdoesAsyncStuff = thunkthatdoesAsyncStuffCreator(1)
store.dispatch( thunkthatdoesAsyncStuff )
  .then(()=>dosomethingAfter())
// Because this dispatch returns a promise, you can .then off it.
// dosomethingAfter() will now get invoked AFTER the axios get request has completed!
//
// Obviously, this can come in handy!  For example, if you need dosomethingAfter() to make use of
// the data in the store obtained from the nested dispatch inside the thunk, and so you need it to wait,
// then this method will work perfectly.
//
// (This is assuming someotherthing is a synchronous action creator... if someotherthing is itself a thunk
// creator then it may be a different story.  See additional notes)



            /*  You CANNOT dot then off the earlier two dispatch examples */

let receiveProductsActionObject=receiveProductsAC(products)
store.dispatch( receiveProductsActionObject )
  .then(()=>dosomethingAfter())
// will throw an error because you can't .then off a simple action object!


let uselessthunk= uselessThunkCreator()
store.dispatch( uselessthunk )
  .then(()=>dosomethingAfter())
// will throw an error because you can't .then off a string!

//---------------------------------------------------------------------------------------------------
//-------------------------------- ADDITIONAL NOTES -------------------------------------------------
//---------------------------------------------------------------------------------------------------

              /*  Just like with any promise chains, MAKE SURE YOU ARE
                 NOT FORGETTING TO RETURN YOUR PROMISES IN YOUR THUNKS IF YOU
                 WANT TO .THEN OFF THE DISPATCHES LATER!!!!!   */

let thunkthatdoesAsyncStuffCreator(some_id){
  return function thunkthatdoesAsyncStuff(dispatch){
    axios.get(`/api/some_need_thing/?some_needed_id=${some_id}`)//(1) THIS IS NOT GOOD *** SEE BELOW
      .then(res=>{
        let someNeededData=res.data
        dispatch(someotherthing(someNeededData))//(2) THIS MAY OR MAY NOT BE GOOD DEPENDING ON WHAT YOU NEED
      })
    }
}

let thunkthatdoesAsyncStuff = thunkthatdoesAsyncStuffCreator(1)
store.dispatch( thunkthatdoesAsyncStuff )
  .then(()=>dosomethingAfter())
// -----(1)-----
//
// THE ABOVE WILL THROW AN ERROR!!  Because the thunk did not return the axios.get( ... )
// it is not returning a promise (actually it's not returning anything, so you'll be dot thening
// off undefined).  It is very easy to forget this!
//
// It may be good practice to just always return a promise in your thunks, in case you want
// to .then off a dispatch later

// -----(2)-----
//
// IF someotherthing(someNeededData) is ITSELF a thunk that performs asynchronous actions, whose results are needed
// for dosomethingAfter() to work properly, then you'll want to (a) return BOTH the dispatch nested inside
// the thunk AND the axios.get, and (b) make sure the someotherthing thunk creator is ALSO returning a promise

// Dispatching an action object is synchronous, however, so if someotherthing is a regular action creator
// then there is no need to return the dispatch
