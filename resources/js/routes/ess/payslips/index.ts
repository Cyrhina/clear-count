import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
export const show = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ess/payslips/{lineId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
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
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
show.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
show.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
    const showForm = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
        showForm.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
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
    show: Object.assign(show, show),
}

export default payslips