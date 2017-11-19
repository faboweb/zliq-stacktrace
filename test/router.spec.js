import { initRouter, removeRouter, Router } from '../src'; 
import { h, testRender, test$ } from 'zliq'; 
 
let location = {pathname: '/route', search: '?param=value', hash: ''}; 
 
describe('Router', ()=> { 
  afterEach(() => {
    removeRouter()
    window.history.pushState({route: '/reset', query: {reset:true}}, 'Reset', '/reset');
  })
  
  it('should react to initial routing', (done) => { 
    let router$ = initRouter(location); 
     
    test$(router$, [
      ({route, params}) => { 
        expect(route).toBe('/route'); 
      } 
    ], done) 
  }); 
 
  it('should react to initial query parameters', (done) => { 
    let router$ = initRouter(location); 
 
    test$(router$, [
      ({route, params}) => { 
        expect(params.param).toBe('value'); 
      } 
    ], done); 
  }); 
 
  it('should react to clicks on internal links', (done) => { 
    let link = <a href="/route2?param2=value2" /> 
 
    let router$ = initRouter(location); 
    
    test$(router$, [
      () => {},
      ({route, params}) => { 
        expect(route).toBe('/route2'); 
        expect(params.param2).toBe('value2'); 
      } 
    ], done); 
 
    testRender(link, [ 
      ({element}) => element.click()
    ], null, true); 
  }); 
  
   it('should react to sequential route changes', (done) => { 
     let router$ = initRouter(location); 
     
     test$(router$, [
       () => {},
       ({route, params}) => { 
         expect(route).toBe('/route2'); 
         expect(params.param2).toBe('value2'); 
       },
       ({route, params}) => { 
         expect(route).toBe('/route'); 
         expect(params.param).toBe('value'); 
         expect(params.param2).toBe(undefined); 
       } 
     ], done); 

     router$.go({
      route: '/route2',
      query: 'param2=value2'
    })
    router$.go({
      route: '/route',
      query: 'param=value'
    })
   }); 
 
  // jsdom fails here 
  it('should react to browser go back events', (done)=> { 
    let router$ = initRouter(); 
    
    test$(router$, [
      () => {},
      () => {},
      () => {
        history.back()
      },
      ({route, params}) => { 
        expect(route).toBe('/lastroute'); 
        expect(params.param).toBe('lastValue'); 
      }
    ], done)

    router$.go('/lastroute?param=lastValue')
    router$.go('/route?param=value')
  }) 

  it('should persist the url changes', (done) => {
    let router$ = initRouter(); 
    
    test$(router$, [
      () => {},
      ({route, params}) => {
        expect(window.location.href).toBe('http://localhost/route?param=value')
      }
    ], done)

    router$.go('/route?param=value')
  })

  it('should persist several url changes', (done) => {
    let router$ = initRouter(); 
    
    test$(router$, [
      () => {},
      ({route, params}) => {
        expect(window.location.href).toBe('http://localhost/route?param=lastValue')
        
        router$.go('/route2?param=lastValue2')
      },
      ({route, params}) => {
        expect(window.location.href).toBe('http://localhost/route2?param=lastValue2')
      }
    ], done)

    router$.go('/route?param=lastValue')
  })

  it('should switch Router components', done => {
    let router$ = initRouter(); 

    let app = <div>
      <a href="/route?param=value#anchor" />
      <Router router$={router$} route='/'>
          <h1>Titel</h1>
      </Router>
      <Router router$={router$} route='/route'>
          <h1>Subpage</h1>
      </Router>
    </div>;

    testRender(app, [ 
      () => router$.go('/route'),
      ({element}) => {
        expect(element.querySelector('h1').innerHTML).toBe('Subpage')
        router$.go('/unknownRoute')
      }, ({element}) => {
        expect(element.querySelector('h1').innerHTML).toBe('Titel')
      }
    ], done, true); 
  })

  it('should use a registered 404 page', done => {
    // location has route '/route'
    let router$ = initRouter(location); 

    let app = <div>
      <Router router$={router$} route='/'>
          <h1>Titel</h1>
      </Router>
      <Router router$={router$} route='/route'>
          <h1>Subpage</h1>
      </Router>
      <Router router$={router$} route='/404'>
          <h1>404</h1>
      </Router>
    </div>;

    testRender(app, [ 
      () => router$.go('/unknownRoute'),
      ({element}) => {
        expect(element.querySelector('h1').innerHTML).toBe('404')
      }
    ], done, true); 
  })
})
