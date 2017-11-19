import {stream, if$, merge$, flatten} from 'zliq'; 
import { removeListener } from 'cluster';

let interceptClickEventInstance

// intercepts clicks on links 
// if the link is local '/...' we change the location hash instead 
function interceptClickEvent(routerState$) {
    return (e) => { 
        let target = e.target || e.srcElement; 
        if (target.tagName === 'A') { 
            let href = target.getAttribute('href'); 
            let isLocal = href && href.startsWith('/'); 
            let isAnchor = href && href.startsWith('#'); 
    
            if (isLocal || isAnchor) { 
                let {anchor, route, query} = parseLink(href); 
                if (route === undefined) { 
                    route = routerState$.value.route; 
                } 
                pushRoute(routerState$, {route, query, anchor}); 
                //tell the browser not to respond to the link click 
                e.preventDefault(); 
            } 
        }
    }
}

export function removeRouter () {
    window.onpopstate = () => {}
    document.removeEventListener('click', interceptClickEventInstance); 
}
function interceptLinks(routerState$) {
    if (interceptClickEventInstance) {
        removeRouter()
    }
    // listen for link click events at the document level 
    interceptClickEventInstance = interceptClickEvent(routerState$)
    document.addEventListener('click', interceptClickEventInstance); 

   // react to HTML5 go back and forward events 
   window.onpopstate = function(event) { 
       if (event.state) { 
           let {route, query} = event.state; 
           dispatchRouteChange(routerState$, route, query); 
       } 
   }; 

}

// this is an element that shows it's content only if the expected route is met 
export function Router({router$, route}, children$) { 
   if (!router$) { 
       console.log('The Router component needs the routerState$ as attribute.') 
       return null; 
   } 
   if (!route) { 
       console.log('The Router component needs the route as attribute.') 
       return null; 
   } 
   // Register the route 
   // this is necessary to decide on a default route 
   router$.$('routes') 
   // routes can be attached async so we check if the route exists and if not add it 
   .map((routes) => routes.indexOf(route) === -1 && router$.patch({ routes: routes.concat(route) })); 

   // check if no registered route was hit and set default if so 
   let sanitizedRoute$ = router$ 
       .map(({route, routes}) => { 
           if (routes.indexOf(route) === -1) { 
               if (routes.indexOf('/404') !== -1) {
                    return '/404';
               }
               return '/'; 
           } 
           return route; 
       }); 

       
   let routeWasHit$ = sanitizedRoute$.is(route).distinct();
   return merge$([routeWasHit$, children$]).map(([wasHit, children]) => { 
       return wasHit ? children : [] 
   }); 
} 

// provide location for testing purposes 
export function initRouter(location = window.location) { 
   let routerState$ = stream({ 
       route: '', 
       params: {}, 
       routes: ['/'] 
   }); 

   interceptLinks(routerState$);
    
   // react to initial routing info 
   if (location.pathname !== '/' || location.search !== "") { 
       // construct initial routing link 
       let {route, query} = parseLink(`${location.pathname || ''}${location.search || ''}${location.hash || ''}`); 
       dispatchRouteChange(routerState$, route, query); 
   }

   routerState$.go = (...args) => { 
       if (args.length > 0 && typeof args[0] === 'string') {
            pushRoute(routerState$, parseLink(args[0]))
       } else {
           pushRoute(routerState$, ...args) 
       }
   }

   return routerState$; 
}


function queryToObject(query = '') {
    return query
    .split('&')
    .map(pair => pair.split('='))
    .reduce((params, [key, value]) => {
        params[key] = value
        return params
    }, {})
}

// matching links in the form of /route/subroute?param1=a&param2=b#anchor 
function parseLink(link) {
    let regexp = /((\/\w*)*)?(\?((\w+=\w*)(&(\w+=\w*)+)*))?(#(\w+))?/; 
    let matchArr = regexp.exec(link); 
    // console.log(link, matchArr)
   return { 
       anchor: matchArr[9], 
       route: matchArr[1], 
       query: matchArr[4]
   } 
}

// callback for HTML5 navigation events 
// save the routing info in the routerState 
function dispatchRouteChange(routerState$, route, query) {
    routerState$.patch({ 
       route: route || '', 
       params: queryToObject(query)
   }); 
} 

function pushRoute(routerState$, {route, query, anchor}) { 
    let url = `${route || '/'}${query ? '?' + query : ''}`
    location.replace(url)
    history.pushState({anchor, route, query}, '', `${route}${query ? '?' + query : '?'}`); 
    if (anchor) { 
      location.hash = '#' + anchor; 
    } 
    dispatchRouteChange(routerState$, route, query); 
}