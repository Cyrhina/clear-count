import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/leave/requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::index
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
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
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/api/leave/requests/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
    const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: preview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
        previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: preview.url(options),
            method: 'post',
        })
    
    preview.form = previewForm
/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/leave/requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
export const cancel = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/leave/requests/{leaveRequest}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
cancel.url = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leaveRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { leaveRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    leaveRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        leaveRequest: typeof args.leaveRequest === 'object'
                ? args.leaveRequest.id
                : args.leaveRequest,
                }

    return cancel.definition.url
            .replace('{leaveRequest}', parsedArgs.leaveRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
cancel.post = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
    const cancelForm = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
        cancelForm.post = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/leave/requests/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
const requests = {
    index: Object.assign(index, index),
preview: Object.assign(preview, preview),
store: Object.assign(store, store),
cancel: Object.assign(cancel, cancel),
decide: Object.assign(decide, decide),
}

export default requests