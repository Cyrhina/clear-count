import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/leave/types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/leave/types',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LeaveController::update
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
export const update = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/leave/types/{leaveType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LeaveController::update
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
update.url = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leaveType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { leaveType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    leaveType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        leaveType: typeof args.leaveType === 'object'
                ? args.leaveType.id
                : args.leaveType,
                }

    return update.definition.url
            .replace('{leaveType}', parsedArgs.leaveType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::update
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
update.put = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LeaveController::update
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
    const updateForm = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::update
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
        updateForm.put = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const types = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default types