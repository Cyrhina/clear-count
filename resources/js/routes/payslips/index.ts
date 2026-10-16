import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
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
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
export const show = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/payslips/{lineId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
show.url = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { lineId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    lineId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        lineId: args.lineId,
                }

    return show.definition.url
            .replace('{lineId}', parsedArgs.lineId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
show.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
show.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
    const showForm = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
        showForm.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
        showForm.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const payslips = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
}

export default payslips