import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/activity-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:19
 * @route '/api/activity-logs'
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
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
export const filters = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: filters.url(options),
    method: 'get',
})

filters.definition = {
    methods: ["get","head"],
    url: '/api/activity-logs/filters',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
filters.url = (options?: RouteQueryOptions) => {
    return filters.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
filters.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: filters.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
filters.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: filters.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
    const filtersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: filters.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
        filtersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: filters.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::filters
 * @see app/Http/Controllers/ActivityLogController.php:45
 * @route '/api/activity-logs/filters'
 */
        filtersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: filters.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    filters.form = filtersForm
/**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
export const show = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/activity-logs/{activityLog}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
show.url = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { activityLog: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { activityLog: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    activityLog: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        activityLog: typeof args.activityLog === 'object'
                ? args.activityLog.id
                : args.activityLog,
                }

    return show.definition.url
            .replace('{activityLog}', parsedArgs.activityLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
show.get = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
show.head = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
    const showForm = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
        showForm.get = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::show
 * @see app/Http/Controllers/ActivityLogController.php:39
 * @route '/api/activity-logs/{activityLog}'
 */
        showForm.head = (args: { activityLog: number | { id: number } } | [activityLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const activityLogs = {
    index: Object.assign(index, index),
filters: Object.assign(filters, filters),
show: Object.assign(show, show),
}

export default activityLogs