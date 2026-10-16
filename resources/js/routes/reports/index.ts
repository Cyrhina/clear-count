import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
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
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
export const show = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/reports/{reportId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
show.url = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reportId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    reportId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reportId: args.reportId,
                }

    return show.definition.url
            .replace('{reportId}', parsedArgs.reportId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
show.get = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
show.head = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
    const showForm = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
        showForm.get = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
        showForm.head = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const reports = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
}

export default reports