import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/work-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WorkLogController::index
 * @see app/Http/Controllers/WorkLogController.php:17
 * @route '/api/work-logs'
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
* @see \App\Http\Controllers\WorkLogController::store
 * @see app/Http/Controllers/WorkLogController.php:34
 * @route '/api/work-logs'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/work-logs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkLogController::store
 * @see app/Http/Controllers/WorkLogController.php:34
 * @route '/api/work-logs'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkLogController::store
 * @see app/Http/Controllers/WorkLogController.php:34
 * @route '/api/work-logs'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkLogController::store
 * @see app/Http/Controllers/WorkLogController.php:34
 * @route '/api/work-logs'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkLogController::store
 * @see app/Http/Controllers/WorkLogController.php:34
 * @route '/api/work-logs'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\WorkLogController::destroy
 * @see app/Http/Controllers/WorkLogController.php:63
 * @route '/api/work-logs/{workLog}'
 */
export const destroy = (args: { workLog: number | { id: number } } | [workLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/work-logs/{workLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkLogController::destroy
 * @see app/Http/Controllers/WorkLogController.php:63
 * @route '/api/work-logs/{workLog}'
 */
destroy.url = (args: { workLog: number | { id: number } } | [workLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workLog: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workLog: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workLog: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workLog: typeof args.workLog === 'object'
                ? args.workLog.id
                : args.workLog,
                }

    return destroy.definition.url
            .replace('{workLog}', parsedArgs.workLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkLogController::destroy
 * @see app/Http/Controllers/WorkLogController.php:63
 * @route '/api/work-logs/{workLog}'
 */
destroy.delete = (args: { workLog: number | { id: number } } | [workLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WorkLogController::destroy
 * @see app/Http/Controllers/WorkLogController.php:63
 * @route '/api/work-logs/{workLog}'
 */
    const destroyForm = (args: { workLog: number | { id: number } } | [workLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkLogController::destroy
 * @see app/Http/Controllers/WorkLogController.php:63
 * @route '/api/work-logs/{workLog}'
 */
        destroyForm.delete = (args: { workLog: number | { id: number } } | [workLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\WorkLogController::decide
 * @see app/Http/Controllers/WorkLogController.php:73
 * @route '/api/work-logs/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/work-logs/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkLogController::decide
 * @see app/Http/Controllers/WorkLogController.php:73
 * @route '/api/work-logs/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkLogController::decide
 * @see app/Http/Controllers/WorkLogController.php:73
 * @route '/api/work-logs/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WorkLogController::decide
 * @see app/Http/Controllers/WorkLogController.php:73
 * @route '/api/work-logs/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WorkLogController::decide
 * @see app/Http/Controllers/WorkLogController.php:73
 * @route '/api/work-logs/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
const workLogs = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
decide: Object.assign(decide, decide),
}

export default workLogs